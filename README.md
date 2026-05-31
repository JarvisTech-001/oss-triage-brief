# codex-oss

`codex-oss` is a small maintainer CLI for turning open source issue reports into
focused Codex maintenance briefs.

The project name is `codex-oss`. It is maintained by
[@JarvisTech-001](https://github.com/JarvisTech-001) and is not affiliated with
OpenAI.

## Why

Open source maintainers spend a lot of time turning incomplete issue reports into
clear next actions. This tool creates a consistent brief that asks Codex to
classify an issue, assign priority, call out missing information, and recommend
the smallest safe next step.

The goal is narrow on purpose: help maintainers move from an issue report to a
clear triage decision without adding a service, database, or hosted dependency.

## What It Does

- Builds a Markdown brief from an issue title, body, number, repository, and
  labels.
- Asks Codex for classification, priority, missing information, and the smallest
  useful next action.
- Keeps the maintainer in control of the final decision.
- Runs locally with no runtime dependencies.

## Install

```sh
npm install
```

## Usage

```sh
node ./src/cli.js issue \
  --repo owner/project \
  --number 42 \
  --title "Crash when reviewing a pull request" \
  --body "Steps: open a PR, start review, see crash." \
  --label bug \
  --label needs-triage
```

The command prints a Markdown brief that can be pasted into Codex.

Example output:

```md
# Codex OSS Maintenance Brief

Repository: owner/project
Issue: #42
Title: Crash when reviewing a pull request
Labels: bug, needs-triage

## Maintainer Task
Triage this issue and propose the smallest safe next step.
```

## Maintainer Workflow

1. Copy the issue title, body, labels, and number.
2. Generate a brief with `codex-oss issue`.
3. Ask Codex to triage the issue from that brief.
4. Use the output to close, ask for more information, accept, or plan the
   smallest implementation.

## Project Scope

This repository starts with issue triage because it is a frequent maintainer
workflow and easy to verify. Future work should stay maintainer-focused:

- pull request review briefs;
- release checklist generation;
- security review prompts for dependency and code changes;
- GitHub issue export helpers.

Features that require accounts, background services, or hidden state should be
avoided unless they directly improve the maintainer workflow.

## Development

```sh
npm run check
```

The project uses the Node.js built-in test runner and has no runtime
dependencies.

## License

MIT
