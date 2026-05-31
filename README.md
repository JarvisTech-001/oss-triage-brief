# oss-triage-brief

[![CI](https://github.com/JarvisTech-001/oss-triage-brief/actions/workflows/ci.yml/badge.svg)](https://github.com/JarvisTech-001/oss-triage-brief/actions/workflows/ci.yml)

`oss-triage-brief` is a small local CLI for open source maintainers. It turns
issue reports and pull request summaries into focused Markdown briefs that can
be pasted into an AI coding assistant or a maintainer review note.

Chinese README: [README.zh-CN.md](README.zh-CN.md)

## Why

Maintainers often spend the first review pass turning loose reports into clear
decisions: classify the issue, identify missing information, review merge risk,
and choose the smallest next action. This project keeps that workflow local,
repeatable, and easy to inspect.

The scope is intentionally narrow. There is no hosted service, account system,
database, telemetry, or runtime dependency.

## Project Status

- Current release: [v0.2.0](https://github.com/JarvisTech-001/oss-triage-brief/releases/tag/v0.2.0).
- CI runs `npm run check` on pushes and pull requests.
- npm publishing is tracked in [issue #2](https://github.com/JarvisTech-001/oss-triage-brief/issues/2).
- `v0.2.0` adds GitHub JSON input, PR diff context, release briefs, examples,
  and a GitHub Action integration example.

## Why This Matters for OSS Maintainers

Issue triage, pull request review, and release preparation are recurring
maintenance tasks that often block project momentum before code changes even
begin. A focused brief gives maintainers a repeatable way to capture the facts,
name the merge risk, ask for missing information, and choose the smallest safe
next step.

That matters most for small and volunteer-led projects, where maintainer time is
the scarce resource. `oss-triage-brief` keeps the workflow lightweight: the
project stays local, the output is plain Markdown, and the maintainer remains in
control of every final decision.

## What It Does

- Builds issue triage briefs from repository, title, body, number, and labels.
- Builds pull request review briefs from repository, title, body, branches, and
  changed files.
- Reads GitHub issue and pull request JSON from `gh` via `--from-json`.
- Summarizes PR diff size and changed files when `--diff` or `--diff-file` is
  provided.
- Builds release checklist briefs for maintainer publish decisions.
- Produces plain Markdown that maintainers can paste into their own review flow.
- Fails fast when required command input is missing.

## Install

```sh
npm install
```

## Usage

### 30-second demo

Generate an issue triage brief from GitHub CLI JSON:

```sh
gh issue view 19 --repo owner/project --json url,title,body,labels \
  | oss-triage-brief issue --from-json
```

Output:

```md
# OSS Maintainer Brief

Repository: owner/project
Issue: #19
Title: CLI should read GitHub issue JSON
Labels: enhancement, roadmap

## Maintainer Task
Triage this issue and propose the smallest safe next step.
```

Generate a PR review brief the same way:

```sh
gh pr view 22 --repo owner/project --json url,title,body,baseRefName,headRefName,files \
  | oss-triage-brief pr --from-json
```

More examples:

- [Issue triage brief](examples/issue-triage.md)
- [Pull request review brief](examples/pr-review.md)
- [GitHub Action workflow](examples/github-action.yml)

### GitHub Action example

Copy [examples/github-action.yml](examples/github-action.yml) into a repository
as `.github/workflows/maintainer-brief.yml` to create a manual workflow that
turns an issue or pull request number into a Markdown maintainer brief.

Generate an issue triage brief:

```sh
node ./src/cli.js issue \
  --repo owner/project \
  --number 42 \
  --title "Crash when reviewing a pull request" \
  --body "Steps: open a PR, start review, see crash." \
  --label bug \
  --label needs-triage
```

Generate a pull request review brief:

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

Manual PR output example:

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

## Maintainer Workflow

1. Copy the issue or pull request metadata.
2. Generate a brief with `oss-triage-brief issue` or `oss-triage-brief pr`.
3. Paste the brief into your review workflow.
4. Use the result to close, ask for more information, request changes, or plan
   the smallest implementation.

## Roadmap

- [GitHub issue JSON input](https://github.com/JarvisTech-001/oss-triage-brief/issues/5)
- [PR diff summary briefs](https://github.com/JarvisTech-001/oss-triage-brief/issues/1)
- [npm package publishing](https://github.com/JarvisTech-001/oss-triage-brief/issues/2)
- [GitHub Action integration](https://github.com/JarvisTech-001/oss-triage-brief/issues/3)
- [Release checklist briefs](https://github.com/JarvisTech-001/oss-triage-brief/issues/4)

## Development

```sh
npm run check
```

The project uses the Node.js built-in test runner and has no runtime
dependencies.

## License

MIT
