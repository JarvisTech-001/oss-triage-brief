export function buildIssueBrief(input) {
  const repo = requireNonEmptyString(input.repo, "repo");
  const title = requireNonEmptyString(input.title, "title");
  const issueNumber = normalizeIssueNumber(input.number);
  const body = normalizeIssueBody(input.body);
  const labels = normalizeLabels(input.labels);

  return [
    "# OSS Maintainer Brief",
    "",
    `Repository: ${repo}`,
    issueNumber === null ? "Issue: not provided" : `Issue: #${issueNumber}`,
    `Title: ${title}`,
    labels.length === 0 ? "Labels: none" : `Labels: ${labels.join(", ")}`,
    "",
    "## Maintainer Task",
    "Triage this issue and propose the smallest safe next step.",
    "",
    "## Issue Body",
    body,
    "",
    "## Constraints",
    "- Preserve existing project behavior unless a change is clearly required.",
    "- Prefer the smallest fix that addresses the reported problem.",
    "- Call out missing reproduction steps or unclear expected behavior.",
    "",
    "## Expected Output",
    "- Classification: bug, feature, question, docs, or maintenance.",
    "- Priority: P0, P1, P2, or P3 with rationale.",
    "- Next action: close, ask for info, accept, or create a focused implementation plan.",
  ].join("\n");
}

export function buildPullRequestBrief(input) {
  const repo = requireNonEmptyString(input.repo, "repo");
  const title = requireNonEmptyString(input.title, "title");
  const pullRequestNumber = normalizeIssueNumber(input.number);
  const body = normalizeIssueBody(input.body);
  const base = requireNonEmptyString(input.base, "base");
  const head = requireNonEmptyString(input.head, "head");
  const changedFiles = normalizeChangedFiles(input.changedFiles);

  return [
    "# OSS Maintainer Brief",
    "",
    `Repository: ${repo}`,
    pullRequestNumber === null ? "Pull request: not provided" : `Pull request: #${pullRequestNumber}`,
    `Title: ${title}`,
    `Base branch: ${base}`,
    `Head branch: ${head}`,
    "Changed files:",
    ...changedFiles.map((file) => `- ${file}`),
    "",
    "## Maintainer Task",
    "Review this pull request for maintainer acceptance.",
    "",
    "## Pull Request Body",
    body,
    "",
    "## Constraints",
    "- Focus on correctness, regressions, test coverage, and maintenance risk.",
    "- Prefer the smallest review comment that would unblock a safe merge.",
    "- Call out missing tests or unclear behavior before proposing broader changes.",
    "",
    "## Expected Output",
    "- Decision: approve, request changes, comment, or needs maintainer follow-up.",
    "- Main risks: list the concrete risks that affect merge safety.",
    "- Next action: smallest action needed before merge.",
  ].join("\n");
}

export function buildReleaseBrief(input) {
  const repo = requireNonEmptyString(input.repo, "repo");
  const version = requireNonEmptyString(input.version, "version");
  const changes = requireNonEmptyString(input.changes, "changes");
  const checks = normalizeChecks(input.checks);

  return [
    "# OSS Maintainer Brief",
    "",
    `Repository: ${repo}`,
    `Release: ${version}`,
    "",
    "## Maintainer Task",
    "Prepare this release for maintainer approval.",
    "",
    "## Planned Changes",
    changes,
    "",
    "## Required Checks",
    ...checks.map((check) => `- ${check}`),
    "",
    "## Constraints",
    "- Confirm tests, package contents, documentation, and release notes before publishing.",
    "- Call out any missing validation that should block the release.",
    "- Prefer the smallest release checklist that makes the publish decision clear.",
    "",
    "## Expected Output",
    "- Release readiness: ready, blocked, or needs follow-up.",
    "- Blocking items: concrete items that must be fixed before release.",
    "- Publish steps: ordered commands or manual checks needed to complete the release.",
  ].join("\n");
}

function requireNonEmptyString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${name} must be a non-empty string; received ${JSON.stringify(value)}`);
  }

  return value.trim();
}

function normalizeIssueNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new TypeError(`number must be a positive integer; received ${JSON.stringify(value)}`);
  }

  return number;
}

function normalizeIssueBody(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return "No issue body provided.";
  }

  return value.trim();
}

function normalizeLabels(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`labels must be an array; received ${JSON.stringify(value)}`);
  }

  return value.map((label) => requireNonEmptyString(label, "label"));
}

function normalizeChangedFiles(value) {
  if (value === undefined || value === null) {
    return ["not provided"];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`changedFiles must be an array; received ${JSON.stringify(value)}`);
  }

  if (value.length === 0) {
    return ["not provided"];
  }

  return value.map((file) => requireNonEmptyString(file, "changedFile"));
}

function normalizeChecks(value) {
  if (value === undefined || value === null) {
    return ["not provided"];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`checks must be an array; received ${JSON.stringify(value)}`);
  }

  if (value.length === 0) {
    return ["not provided"];
  }

  return value.map((check) => requireNonEmptyString(check, "check"));
}
