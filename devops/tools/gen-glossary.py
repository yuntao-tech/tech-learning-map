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
import re, json, glob, os, sys, collections, html as _html

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
        for part in [en_txt] + re.split(r'\s*/\s*|\s*→\s*', en_txt):
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

for e in G.values():
    if not e.get('definition') and e.get('expansion'):
        e['definition'] = e['expansion']

out = ('// 本文件由 tools/gen-glossary.py 生成，请勿手工编辑。\n'
       '// 数据源：附录 A1 术语表 / A2 缩略语 / 各章知识点标题 / WordMaster DevOps 术语库（英语层）\n'
       'window.GLOSSARY = ' + json.dumps(G, ensure_ascii=False, indent=1, sort_keys=True) + ';\n')
open('data/glossary.js', 'w', encoding='utf-8').write(out)

print(f"A1 {n_a1} 行 · A2 {n_a2} 行 · 知识点 {n_kp} 个 → 词条 {len(G)} 条")
print(f"锚点校验：丢弃 {dropped} 个跨页错配的锚点")
print(f"带「更多」英语层的 {n_more} 条" + ("（已应用审阅修订）" if WMREV and os.path.isdir(WMREV) else ""))
print(f"→ data/glossary.js  {os.path.getsize('data/glossary.js')/1024:.0f} KB")
