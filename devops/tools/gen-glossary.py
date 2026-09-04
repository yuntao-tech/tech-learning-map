#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 data/glossary.js —— 站内术语弹层的数据源。

数据优先级（本站是「学知识体系」，不是「学英语」）：
  1. A1 术语表     中文译名 + 一句话定义 + 主讲小节   ← 主内容
  2. 知识点标题     中文名 + 直达锚点 + 徽章
  3. A2 缩略语     缩写展开
  4. WordMaster    日常义 / 字面 / 词源 / 易错点     ← 次要，折进「更多」

用法：python3 tools/gen-glossary.py
不联网、不调模型，纯解析本仓库 + WordMaster 的审阅成果。
"""
import re, json, glob, os, sys, collections, sqlite3, html as _html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
WM = '/Users/yt/works/personal/WordMaster'
WMREV = f'{WM}/docs/10_开发计划/DevOps术语专区/review'

def strip(x):  return _html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x))).strip()
def norm(x):   return re.sub(r'[^a-z0-9]+', ' ', x.lower()).strip()
def debadge(x):return re.split(r'[⭐📘📝🧭⚠️📌🆕①②③④⑤]', x)[0].strip()

BADGE = {'badge--core':'core','badge--hot':'hot','badge--warn':'warn',
         'badge--new':'new','badge--ext':'ext','badge--note':'note','badge--plain':'plain'}

def table_rows(path):
    s = open(path, encoding='utf-8').read()
    out = []
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', s, re.S):
        tds = re.findall(r'<td>(.*?)</td>', tr, re.S)
        if len(tds) >= 3:
            href = re.search(r'href="([^"]+)"', tr)
            out.append(([strip(t) for t in tds], href.group(1) if href else None))
    return out

def to_root(href, from_dir):
    """把页面内的相对链接改写成相对站点根的路径"""
    if not href or href.startswith(('http', '#')): return None
    p = os.path.normpath(os.path.join(from_dir, href.split('#')[0]))
    return p.replace(os.sep, '/') if os.path.exists(p) else None


# ── 音标 ───────────────────────────────────────────────────
# 三个来源，按可信度排序：
#   1. 本表       —— DevOps 造词与专名，通用词典查不到，人工确认后写入（美音）
#   2. WordMaster —— 已经过词源审阅的美音标注
#   3. ECDICT     —— 42k 词通用词典兜底（英音体例，符号需归一）
# 查不到就不给音标，交给朗读按钮。绝不猜。
IPA_MANUAL = {
    "devops": "\u02c8dev\u0251ps", "gitops": "\u02c8\u0261\u026at\u0251ps",
    "chatops": "\u02c8t\u0283\u00e6t\u0251ps", "aiops": "\u02c8e\u026a\u0061\u026a\u02cc\u0251ps",
    "devsecops": "\u02ccdevsek\u02c8\u0251ps",
    "kubernetes": "\u02ccku\u02d0b\u0259r\u02c8neti\u02d0z",
    "microservices": "\u02c8ma\u026akro\u028a\u02ccs\u025crv\u026as\u026az",
    "microservice": "\u02c8ma\u026akro\u028a\u02ccs\u025crv\u026as",
    "kanban": "\u02c8k\u0251nb\u0251n", "scrum": "skr\u028cm",
    "agile": "\u02c8\u00e6d\u0292\u0259l", "postmortem": "po\u028ast\u02c8m\u0254rt\u0259m",
    "conway": "\u02c8k\u0251nwe\u026a", "toolchain": "\u02c8tu\u02d0lt\u0283e\u026an",
    "runbook": "\u02c8r\u028cnb\u028ak", "playbook": "\u02c8ple\u026ab\u028ak",
    "observability": "\u0259b\u02ccz\u025crv\u0259\u02c8b\u026al\u0259ti",
    "telemetry": "t\u0259\u02c8lem\u0259tri", "cadence": "\u02c8ke\u026adns",
    "backlog": "\u02c8b\u00e6kl\u0254\u0261", "workflow": "\u02c8w\u025crkflo\u028a",
}

def _clean_ipa(p):
    """ECDICT 的体例要归一：
    - 西里尔字母 ә（U+04D9）当 schwa 用，出现 6700 多次 → 换回 IPA ə
    - 一词多读写成 "li:d. led"（lead 的名/动两读）→ 只取第一个，
      否则会拼出 /tʃeɪndʒ li:d. led taɪm/ 这种没法念的东西
    - 重音记号用 . 和 ' → 换成 IPA 的 ˌ 和 ˈ"""
    p = p.strip().strip("/[]").replace("\u04d9", "\u0259").replace("\u04dd", "\u025c")
    p = re.split(r"[.,;]\s+", p)[0].strip().rstrip(".,;")
    p = re.sub(r"\.(?=[a-z\u0250-\u02af])", "\u02cc", p)
    return p.replace("'", "\u02c8").strip()

_EC = {}
try:
    _db = sqlite3.connect(f"{WM}/WordMaster/Resources/dictionary.db")
    _EC = {w.lower(): p for w, p in
           _db.execute("SELECT word,phonetic FROM dict WHERE phonetic IS NOT NULL AND phonetic!=''")}
except Exception as _e:
    print(f"  \u26a0\ufe0f  \u672a\u80fd\u8bfb\u53d6 ECDICT \u8bcd\u5178\uff08{_e}\uff09", file=sys.stderr)

def word_ipa(w, wm_words):
    """只认词形本身。不做词形还原——把 Goals 还原成 goal 会读出单数 /gəul/，
    把 families 还原成 family 会读出 /'fæməli/，都是错的读音。查不到就查不到。"""
    lw = w.lower()
    if lw in IPA_MANUAL: return IPA_MANUAL[lw]
    if lw in wm_words:   return _clean_ipa(wm_words[lw])
    if lw in _EC:        return _clean_ipa(_EC[lw])
    return None

# 复合标题（一行列了几个术语）没有单一读音；纯缩写逐字母读，也不给音标
_NO_IPA = re.compile(r"[\u00b7:()]|\bvs\b|&|\u2192|,")
_ACRONYM = re.compile(r"^[A-Z][A-Za-z]{0,5}$")

# 虚词：出现这些说明标题是个句子，不是术语，拼出来的音标必然是错的
_FUNC = set("a an the and or of to in on for with is are was were be not no how what "
            "why when where which that this these those vs versus each other together "
            "from as at by into it its their there here you your we our".split())
_NO_IPA = re.compile(r"[\u00b7:()]|&|\u2192|,|/")
_ACRONYM = re.compile(r"^[A-Z][A-Za-z]{0,5}$")

def term_ipa(en, wm_terms, wm_words):
    """整词命中最可靠；退而求其次只拼「不超过 3 个实词」的短术语。
    句子式标题、含虚词的、复合并列的一律不给音标——宁可空着让朗读按钮兜底，
    也不能给一个看起来像模像样的错读音。"""
    k = norm(en)
    if k in wm_terms: return _clean_ipa(wm_terms[k])
    if _NO_IPA.search(en): return None
    ws = [w for w in re.split(r"[^A-Za-z]+", en) if w]
    if not ws or len(ws) > 3: return None
    if any(w.lower() in _FUNC for w in ws): return None
    if len(ws) == 1 and _ACRONYM.match(ws[0]) and ws[0].lower() not in wm_words \
       and ws[0].lower() not in _EC and ws[0].lower() not in IPA_MANUAL:
        return None
    parts = [word_ipa(w, wm_words) for w in ws]
    return " ".join(parts) if all(parts) else None



# ── 释义层：英文母语者释义 + 组合词逐词拆解 ──────────────────
# 弹层空间够大，中文定义之外再给：①术语本身的英文释义 ②组合词每个成分词的义。
# 成分词单独存一张表，词条只存词形数组——同一个 continuous 出现十几次，
# 存十几份释义会把文件撑爆。
def _clean_zh(t):
    """ECDICT 的 translation 是词典 dump：多行、带 [医][计] 学科标签、词性行可能被截断。
    库里既有真换行，也有字面的反斜杠 n 两个字符。直接摆进卡片会出现
    「n. 水流, 小河, 流出, 趋势, 人潮\\n vt.」这种东西。
    只取第一段、去掉学科标签、最多留四个义项。"""
    if not t:
        return ""
    t = t.replace("\\n", "\n").replace("\\r", "\n")
    line = ""
    for ln in re.split(r"[\r\n]+", t):
        ln = re.sub(r"\[[^\]]{1,6}\]", "", ln).strip()
        if not ln:
            continue
        if re.fullmatch(r"[a-z]{1,4}\.?", ln):
            continue
        line = ln
        break
    if not line:
        return ""
    m = re.match(r"^([a-z]{1,4}\.)\s*(.*)$", line)
    pos, body = (m.group(1), m.group(2)) if m else ("", line)
    senses = [x.strip() for x in re.split(r"[,，;；]", body) if x.strip()][:4]
    return (pos + " " if pos else "") + "、".join(senses)

_ED, _SE, _BE = {}, {}, {}
_ECT = {}
try:
    _ED = json.load(open(f"{WM}/WordMaster/Resources/english_defs.json"))["defs"]
    _SE = json.load(open(f"{WM}/WordMaster/Resources/senses.json"))["entries"]
    _BE = {w["word"].lower(): w for w in json.load(open(f"{WM}/WordMaster/Resources/basic_english.json"))}
    _ECT = {w.lower(): _clean_zh(t) for w, t in
            _db.execute("SELECT word,translation FROM dict WHERE translation IS NOT NULL AND translation!=''")}
except Exception as _e:
    print(f"  \u26a0\ufe0f  \u91ca\u4e49\u6e90\u8bfb\u53d6\u5931\u8d25\uff08{_e}\uff09", file=sys.stderr)

# 虚词与序数残片，拆出来没有教学价值
_PART_STOP = set(("a an the and or of to in on at for is are was were be with without "
                  "vs versus how what why when where not it its their this that these those "
                  "st nd rd th as by from into more less than").split())

def _lemma_candidates(w):
    """释义可以退到基础词形（operations → operation），因为义项是同一个。
    注意这条规则不能用在音标上——Goals 读成 /gəul/ 就是教错读音。"""
    w = w.lower(); out = [w]
    for suf, rep in (("ies", "y"), ("ves", "f"), ("es", ""), ("s", ""),
                     ("ing", ""), ("ed", ""), ("ly", ""), ("ally", "al")):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            b = w[:-len(suf)] + rep
            out.append(b)
            if suf in ("ing", "ed"):
                out.append(b + "e")
                if len(b) > 3 and b[-1] == b[-2]: out.append(b[:-1])
    return out

def word_gloss(w, wm_words):
    """返回 (词形, 中文义, 英文母语释义)；查不到返回 None"""
    for c in _lemma_candidates(w):
        wmw = wm_words_full.get(c, {})
        zh = wmw.get("dailyZh") or _ECT.get(c) or (_BE.get(c, {}) or {}).get("meaning")
        en = (wmw.get("dailyEn") or (_ED.get(c, {}) or {}).get("en")
              or ((_SE.get(c, {}) or {}).get("senses") or [{}])[0].get("en")
              or (_BE.get(c, {}) or {}).get("englishDef"))
        if zh or en:
            return c, (zh or "").strip(), (en or "").strip()
    return None


wm_words_full = {}
G = {}                      # normkey -> entry
def put(key, **kw):
    e = G.setdefault(key, {})
    for k, v in kw.items():
        if v and not e.get(k): e[k] = v

# ── 1. A1 术语表（主内容）────────────────────────────────────
n_a1 = 0
for tds, href in table_rows('content/appendix/a1-glossary.html'):
    en, zh, dfn = tds[0], tds[1], tds[2] if len(tds) > 2 else ''
    if not en or not re.search(r'[A-Za-z]', en): continue
    put(norm(en), en=debadge(en), zh=zh, definition=dfn,
        href=to_root(href, 'content/appendix'))
    n_a1 += 1

# ── 2. A2 缩略语 ────────────────────────────────────────────
n_a2 = 0
def split_zh(cell):
    """A2 第三列写法是「<短中文名>。<辨析>」或「<短中文名> —— <辨析>」。
    短名当标题，整句当释义；标题拿去当释义会让弹层顶部塞进一整段话。"""
    m = re.split(r'。|\s+——\s+', cell, maxsplit=1)
    head = m[0].strip()
    if head and len(head) <= 16 and len(m) > 1:
        return head, cell
    return (head if len(head) <= 16 else ''), cell

for tds, href in table_rows('content/appendix/a2-acronyms.html'):
    ab, full, cell = debadge(tds[0]), tds[1], tds[2] if len(tds) > 2 else ''
    zh, dfn = split_zh(cell)
    if not ab: continue
    h = to_root(href, 'content/appendix')
    put(norm(ab),   en=ab, zh=zh or ab, definition=dfn, abbr=ab, expansion=full, href=h)
    if full and re.search(r'[A-Za-z]', full):
        put(norm(full), en=full, zh=zh or full, definition=dfn, abbr=ab, href=h)
    n_a2 += 1

# ── 3. 知识点标题（提供直达锚点与徽章）────────────────────────
n_kp = 0
for f in sorted(glob.glob('content/**/*.html', recursive=True)):
    if '/appendix/' in f: continue
    s = open(f, encoding='utf-8').read()
    d = os.path.dirname(f)
    for m in re.finditer(
        r'<article class="kp" id="(kp-[\w.-]+)">(.*?)</div>\s*<div class="kp__body"', s, re.S):
        kpid, head = m.group(1), m.group(2)
        t = re.search(r'<h3 class="kp__title">(.*?)</h3>', head, re.S)
        if not t: continue
        inner = t.group(1)
        en = re.search(r'<span class="en">(.*?)</span>', inner, re.S)
        if not en: continue
        en_txt = strip(en.group(1))
        zh_txt = strip(re.sub(r'<span class="en">.*?</span>', '', inner, flags=re.S))
        badges = [BADGE[c] for c in re.findall(r'badge--\w+', head) if c in BADGE]
        # 只在有空格的分隔符上拆。「Continuous Integration / Continuous Delivery」
        # 是两个术语并列，该拆；「Mean Time to Repair/Recover」是同一个词的两种写法，
        # 拆了会产出「Recover (MTTR)」这种碎片当标题。
        for part in [en_txt] + re.split(r'\s+/\s+|\s*→\s*', en_txt):
            k = norm(part)
            if not k: continue
            put(k, en=part.strip(), zh=zh_txt, href=f.replace(os.sep, '/'),
                kp=kpid, kp_href=f.replace(os.sep, '/'), badges=badges or None)
        n_kp += 1

# ── 4. WordMaster：英语层，折进「更多」───────────────────────
n_more = 0
if os.path.isdir(WMREV):
    d = json.load(open(f'{WM}/WordMaster/Resources/devops_terms.json'))
    T = {t['id']: t for t in d['terms']}
    WD = {w['word']: w for w in d['words']}
    try:                                     # 应用审阅修订与新增，拿到已勘误的版本
        patch = json.load(open(f'{WMREV}/04_修订.json'))
        new   = json.load(open(f'{WMREV}/03_新增术语.json'))
        for k, v in patch['terms'].items(): T.get(k, {}).update(v)
        for k, v in patch['words'].items(): WD.get(k, {}).update(v)
        for t in new['terms']: T[t['id']] = t
        for w in new['words']: WD[w['word']] = w
        corrected = True
    except Exception as e:
        corrected = False
        print(f"  ⚠️  未能应用 WordMaster 审阅修订（{e}），将使用未勘误版本", file=sys.stderr)

    def more_from_term(t):
        m = {}
        if t.get('daily'):
            m['dailyZh'] = t['daily'].get('zh'); m['dailyEx'] = t['daily'].get('example')
            m['dailyExZh'] = t['daily'].get('exampleZh')
        for k_src, k_dst in (('literal','literal'), ('etymology','etymology')):
            if t.get(k_src): m[k_dst] = t[k_src]
        if t.get('pitfalls'):
            p = t['pitfalls'][0]
            m['pitfall'] = f"{p.get('wrong','')} → {p.get('right','')}".strip(' →')
        return {k: v for k, v in m.items() if v}

    def more_from_word(w):
        m = {'dailyZh': w.get('dailyZh'), 'dailyEx': w.get('example'),
             'dailyExZh': w.get('exampleZh'), 'literal': w.get('literal'),
             'etymology': w.get('etymology'), 'pitfall': w.get('pitfall')}
        return {k: v for k, v in m.items() if v}

    globals()['wm_words_full'] = {w['word'].lower(): w for w in WD.values()}
    globals()['TECH_EN'] = {}
    for t in T.values():
        te = (t.get('tech') or {}).get('en')
        if not te: continue
        TECH_EN.setdefault(norm(t['term']), te)
        for a in (t.get('aliases') or []): TECH_EN.setdefault(norm(a), te)
        if t.get('abbr'): TECH_EN.setdefault(norm(t['abbr']), te)
    globals()['WM_TERMS'] = {norm(t['term']): t['phonetic'] for t in T.values() if t.get('phonetic')}
    globals()['WM_WORDS'] = {w['word'].lower(): w['phonetic'] for w in WD.values() if w.get('phonetic')}

    lookup = {}
    for t in T.values():
        lookup.setdefault(norm(t['term']), ('t', t))
        for a in (t.get('aliases') or []): lookup.setdefault(norm(a), ('t', t))
        if t.get('abbr'): lookup.setdefault(norm(t['abbr']), ('t', t))
    for w in WD.values(): lookup.setdefault(norm(w['word']), ('w', w))

    # 只在「整个术语」层面精确匹配。绝不把词组拆成单词去碰运气——
    # 那会让「1st Way: Continuous Flow」挂上 continuous 的日常义，
    # 而本站是学知识体系，不是学英语。
    for key, e in G.items():
        cands = [key] + [norm(p) for p in re.split(r'\s*/\s*|\s*·\s*', e.get('en', ''))]
        for c in cands:
            if c in lookup:
                kind, obj = lookup[c]
                m = more_from_term(obj) if kind == 't' else more_from_word(obj)
                composite = bool(re.search(r'·|/|\(', e.get('en', '')))
                if m and not composite:
                    e['more'] = m; n_more += 1
                break

# ── 收尾 ───────────────────────────────────────────────────
G = {k: v for k, v in G.items() if v.get('zh') or v.get('definition')}

# 锚点校验：href 与 kp 可能来自不同数据源（A1 给主讲小节，知识点标题给锚点），
# 配错了会跳到一个不存在的锚点。只保留「锚点确实在该页」的那些。
_cache, dropped = {}, 0
for e in G.values():
    e.pop('kp_href', None)
    if not (e.get('kp') and e.get('href')): e.pop('kp', None); continue
    h = e['href']
    if h not in _cache:
        try: _cache[h] = open(h, encoding='utf-8').read()
        except OSError: _cache[h] = ''
    if ('id="%s"' % e['kp']) not in _cache[h]:
        e.pop('kp'); dropped += 1

n_ipa = 0
_wt, _ww = globals().get('WM_TERMS', {}), globals().get('WM_WORDS', {})
for e in G.values():
    ph = term_ipa(e.get('en', ''), _wt, _ww)
    if ph: e['ipa'] = '/' + ph + '/'; n_ipa += 1

for e in G.values():
    if not e.get('definition') and e.get('expansion'):
        e['definition'] = e['expansion']

# 术语本身的英文母语释义
_tech_en = globals().get('TECH_EN', {})
n_defen = 0
for e in G.values():
    k = norm(e.get('en', ''))
    d = (_tech_en.get(k) or (_ED.get(k, {}) or {}).get('en')
         or ((_SE.get(k, {}) or {}).get('senses') or [{}])[0].get('en'))
    if d: e['defEn'] = d.strip(); n_defen += 1

# 组合词逐词拆解：词条只存词形，释义进共享词表
WORDS, n_parts = {}, 0
for e in G.values():
    raw = [w for w in re.split(r'[^A-Za-z]+', e.get('en', '')) if w]
    ws = [w for w in raw if len(w) > 1 and w.lower() not in _PART_STOP]
    if len(ws) < 2: continue
    keep = []
    for w in ws:
        g = word_gloss(w, wm_words_full)
        if not g: continue
        lem, zh, en = g
        if not (zh or en): continue
        key = w.lower()
        if key not in WORDS:
            entry = {}
            ip = word_ipa(w, globals().get('WM_WORDS', {}))
            if ip: entry['ipa'] = '/' + ip + '/'
            if zh: entry['zh'] = zh
            if en: entry['en'] = en
            if lem != key: entry['lemma'] = lem      # 释义取自基础词形，如实标出
            WORDS[key] = entry
        if key not in keep: keep.append(key)
    if len(keep) >= 2:
        e['parts'] = keep
        n_parts += 1

print(f"英文母语释义 {n_defen} 条 · 逐词拆解 {n_parts} 条组合词，共 {len(WORDS)} 个成分词")

out = ('// 本文件由 tools/gen-glossary.py 生成，请勿手工编辑。\n'
       '// 数据源：附录 A1 术语表 / A2 缩略语 / 各章知识点标题 / WordMaster DevOps 术语库（英语层）\n'
       'window.GLOSSARY = ' + json.dumps(G, ensure_ascii=False, indent=1, sort_keys=True) + ';\n'
       'window.GLOSSARY_WORDS = ' + json.dumps(WORDS, ensure_ascii=False, indent=1, sort_keys=True) + ';\n')
open('data/glossary.js', 'w', encoding='utf-8').write(out)

print(f"A1 {n_a1} 行 · A2 {n_a2} 行 · 知识点 {n_kp} 个 → 词条 {len(G)} 条")
print(f"锚点校验：丢弃 {dropped} 个跨页错配的锚点")
print(f"音标 {n_ipa}/{len(G)} 条（{100*n_ipa//len(G)}%），其余交给朗读")
print(f"带「更多」英语层的 {n_more} 条" + ("（已应用审阅修订）" if WMREV and os.path.isdir(WMREV) else ""))
print(f"→ data/glossary.js  {os.path.getsize('data/glossary.js')/1024:.0f} KB")
