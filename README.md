# codex-oss

`codex-oss` is a small maintainer CLI that turns open source issue reports into
focused Codex maintenance briefs.

It is not affiliated with OpenAI.

## Why

Open source maintainers spend a lot of time turning incomplete issue reports into
clear next actions. This tool creates a consistent brief that asks Codex to
classify an issue, assign priority, call out missing information, and recommend
the smallest safe next step.

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

## Maintainer Workflow

1. Copy the issue title, body, labels, and number.
2. Generate a brief with `codex-oss issue`.
3. Ask Codex to triage the issue from that brief.
4. Use the output to close, ask for more information, accept, or plan the
   smallest implementation.

## Development

```sh
npm test
npm run lint
```

The project uses the Node.js built-in test runner and has no runtime
dependencies.
