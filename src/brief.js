export function buildIssueBrief(input) {
  const repo = requireNonEmptyString(input.repo, "repo");
  const title = requireNonEmptyString(input.title, "title");
  const issueNumber = normalizeIssueNumber(input.number);
  const body = normalizeIssueBody(input.body);
  const labels = normalizeLabels(input.labels);

  return [
    "# Codex OSS Maintenance Brief",
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
