# 参与贡献

这是一张持续生长的中文技术学习地图，欢迎任何人参与。

## 可以做什么

| 类型 | 说明 |
|---|---|
| 勘误 | 事实错误、过时信息、错别字、死链、页面显示问题 |
| 延伸章节 | DevOps 体系的 ext E1–E7：GitOps、Kubernetes、IaC 工具、可观测性技术栈、供应链安全、Team Topologies、FinOps。结构已在 `devops/data/syllabus.js` 预留 |
| 练习题 | 按章自主命制仿真题，字段格式见 [01-阶段计划.md](devops/docs/00-项目规划/01-阶段计划.md) 的 P2 章节 |
| 新技术体系 | Kubernetes、SRE、ITIL 4、云厂商认证等，在根目录新建一个体系目录，约定见 [README](README.md#目录约定) |

剩余工作的完整清单和建议顺序见 [06-进度与交接.md](devops/docs/00-项目规划/06-进度与交接.md)。

勘误、错别字这类小改动直接提 PR。新章节、新体系这类大改动，请先开一个 issue 说说打算怎么写，
免得和别人撞车或者返工。

## 本地预览

纯静态站点，零依赖、零构建。直接双击 `devops/index.html`，或者在仓库根目录起一个本地服务器：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000/>。提交前请在浏览器里打开改过的页面，深色、浅色两种主题各看一眼。

## 写作规范

写正文之前请先读 `devops/docs/00-项目规划/` 下的三份文档：

- [02-内容写作规范.md](devops/docs/00-项目规划/02-内容写作规范.md)：语言风格、知识点「六面」模板、徽章、图表
- [03-来源标注规范.md](devops/docs/00-项目规划/03-来源标注规范.md)：官方事实、推断、延伸怎么区分，以及版权红线
- [05-写作契约.md](devops/docs/00-项目规划/05-写作契约.md)：官方事实包、徽章判定规则、统一译法表（不要自创译名）

新增一节：在 `devops/data/syllabus.js` 里把该节的 `status` 改成 `"done"`，复制骨架模板
[`2.1-three-ways.html`](devops/content/ch02-core-principles/2.1-three-ways.html)，
改好 `<title>`、`<meta description>`、`window.PAGE` 三处再写正文。侧栏、上下页和进度统计会自动更新。

## 版权红线

- 不复制官方样题原文，也不复制官方 Learner Workbook / Quick Reference Guide 的成段文字。
  练习题一律自主命制，并标注「仿真题，非官方真题」。
- 图表全部自制，不复制官方图示。
- 引用官方定义时控制在必要长度并注明出处，解释和展开用自己的话。
- 推断必须写成推断，不能包装成官方口径。

## 术语弹层数据

`devops/data/glossary.js` 由维护者用 `devops/tools/gen-glossary.py` 生成。生成时要用到维护者本机的术语库，
缺了它，生成结果会丢掉英文释义和音标，所以请不要重新生成，也不要手工修改这个文件。
改了附录 A1 术语表或知识点标题之后不用管它，合并后由维护者重新生成。术语卡片有错，开 issue 说明即可。

## 提交 PR

1. Fork 本仓库，从 `main` 拉一个分支；
2. 修改，并在本地自查；
3. 提 PR，写清改了什么、依据是什么（官方来源请写文件名和版本）。

## 许可

提交贡献即表示你同意：内容部分以 [CC BY 4.0](LICENSE) 发布，代码部分以 [MIT](LICENSE-CODE) 发布，与本仓库一致。
