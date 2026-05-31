# oss-triage-brief

[![CI](https://github.com/JarvisTech-001/oss-triage-brief/actions/workflows/ci.yml/badge.svg)](https://github.com/JarvisTech-001/oss-triage-brief/actions/workflows/ci.yml)

`oss-triage-brief` 是一个面向开源维护者的本地 CLI。它把 issue 报告和
pull request 摘要整理成结构清晰的 Markdown brief，方便维护者粘贴到 AI
编程助手或自己的评审流程里。

英文 README: [README.md](README.md)

## 为什么做这个项目

维护开源项目时，第一轮工作经常不是写代码，而是把松散的信息整理成可执行
判断：这个 issue 属于什么类型、缺少什么复现信息、PR 是否有合并风险、下一步
最小动作是什么。

这个项目只解决这个窄问题：在本地生成可检查、可复制、可复用的维护 brief。
它不需要账号、不提供托管服务、不保存数据、不上传遥测，也没有运行时依赖。

## 项目状态

- 当前 release: [v0.1.0](https://github.com/JarvisTech-001/oss-triage-brief/releases/tag/v0.1.0)。
- CI 会在 push 和 pull request 上运行 `npm run check`。
- npm 包已经准备好发布，但当前还没有发布；下一步需要先完成 npm 账号登录，
  然后执行 `npm publish --access public`。
- 后续维护方向已经用 roadmap issues 跟踪。

## 为什么这对 OSS 维护者重要

issue triage、PR review 和 release 准备都是高频维护工作，而且经常发生在真正
写代码之前。结构化 brief 可以帮助维护者重复稳定地记录事实、指出合并风险、
追问缺失信息，并选择最小的安全下一步。

这对小团队和志愿维护项目尤其重要，因为维护者时间通常是最稀缺的资源。
`oss-triage-brief` 保持足够轻：本地运行、输出纯 Markdown，最终判断仍由维护者
掌控。

## 能做什么

- 根据仓库、标题、正文、编号和标签生成 issue triage brief。
- 根据仓库、标题、正文、分支和变更文件生成 PR review brief。
- 输出纯 Markdown，维护者可以放进自己的工作流。
- 缺少必要参数时快速失败，并给出明确错误。

## 安装

```sh
npm install
```

## 使用

### 30 秒 demo

从 GitHub CLI JSON 生成 issue triage brief：

```sh
gh issue view 19 --repo owner/project --json url,title,body,labels \
  | oss-triage-brief issue --from-json
```

输出：

```md
# OSS Maintainer Brief

Repository: owner/project
Issue: #19
Title: CLI should read GitHub issue JSON
Labels: enhancement, roadmap

## Maintainer Task
Triage this issue and propose the smallest safe next step.
```

PR review brief 也可以使用同样的方式生成：

```sh
gh pr view 22 --repo owner/project --json url,title,body,baseRefName,headRefName,files \
  | oss-triage-brief pr --from-json
```

更多示例：

- [Issue triage brief](examples/issue-triage.md)
- [Pull request review brief](examples/pr-review.md)

生成 issue triage brief：

```sh
node ./src/cli.js issue \
  --repo owner/project \
  --number 42 \
  --title "Crash when reviewing a pull request" \
  --body "Steps: open a PR, start review, see crash." \
  --label bug \
  --label needs-triage
```

生成 PR review brief：

```sh
node ./src/cli.js pr \
  --repo owner/project \
  --number 18 \
  --title "Add release checklist" \
  --body "Adds a release checklist command." \
  --base main \
  --head release-checklist \
  --changed-file src/cli.js \
  --changed-file test/brief.test.js
```

手动 PR 输出示例：

```md
# OSS Maintainer Brief

Repository: owner/project
Pull request: #18
Title: Add release checklist
Base branch: main
Head branch: release-checklist
Changed files:
- src/cli.js
- test/brief.test.js
```

## 维护者工作流

1. 复制 issue 或 PR 的基本信息。
2. 使用 `oss-triage-brief issue` 或 `oss-triage-brief pr` 生成 brief。
3. 把 brief 粘贴进你的评审流程。
4. 根据结果关闭、追问信息、要求修改，或制定最小实现计划。

## Roadmap

- [GitHub issue JSON 输入](https://github.com/JarvisTech-001/oss-triage-brief/issues/5)
- [PR diff summary brief](https://github.com/JarvisTech-001/oss-triage-brief/issues/1)
- [发布 npm package](https://github.com/JarvisTech-001/oss-triage-brief/issues/2)
- [GitHub Action integration](https://github.com/JarvisTech-001/oss-triage-brief/issues/3)
- [Release checklist brief](https://github.com/JarvisTech-001/oss-triage-brief/issues/4)

## 开发

```sh
npm run check
```

项目使用 Node.js 内置测试运行器，没有运行时依赖。

## 许可证

MIT
