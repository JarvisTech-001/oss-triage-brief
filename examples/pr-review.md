# Pull Request Review Example

Command:

```sh
gh pr view 22 --repo owner/project --json url,title,body,baseRefName,headRefName,files \
  | oss-triage-brief pr --from-json
```

Input JSON:

```json
{
  "url": "https://github.com/owner/project/pull/22",
  "title": "Add JSON input",
  "body": "Reads gh issue and gh pr JSON output from stdin.",
  "baseRefName": "main",
  "headRefName": "json-input",
  "files": [
    { "path": "src/cli.js" },
    { "path": "test/brief.test.js" }
  ]
}
```

Output:

```md
# OSS Maintainer Brief

Repository: owner/project
Pull request: #22
Title: Add JSON input
Base branch: main
Head branch: json-input
Changed files:
- src/cli.js
- test/brief.test.js

## Maintainer Task
Review this pull request for maintainer acceptance.

## Pull Request Body
Reads gh issue and gh pr JSON output from stdin.

## Constraints
- Focus on correctness, regressions, test coverage, and maintenance risk.
- Prefer the smallest review comment that would unblock a safe merge.
- Call out missing tests or unclear behavior before proposing broader changes.

## Expected Output
- Decision: approve, request changes, comment, or needs maintainer follow-up.
- Main risks: list the concrete risks that affect merge safety.
- Next action: smallest action needed before merge.
```
