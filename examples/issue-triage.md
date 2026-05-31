# Issue Triage Example

Command:

```sh
gh issue view 19 --repo owner/project --json url,title,body,labels \
  | oss-triage-brief issue --from-json
```

Input JSON:

```json
{
  "url": "https://github.com/owner/project/issues/19",
  "title": "CLI should read GitHub issue JSON",
  "body": "Maintainers should be able to pipe gh issue view output into the CLI.",
  "labels": [
    { "name": "enhancement" },
    { "name": "roadmap" }
  ]
}
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

## Issue Body
Maintainers should be able to pipe gh issue view output into the CLI.

## Constraints
- Preserve existing project behavior unless a change is clearly required.
- Prefer the smallest fix that addresses the reported problem.
- Call out missing reproduction steps or unclear expected behavior.

## Expected Output
- Classification: bug, feature, question, docs, or maintenance.
- Priority: P0, P1, P2, or P3 with rationale.
- Next action: close, ask for info, accept, or create a focused implementation plan.
```
