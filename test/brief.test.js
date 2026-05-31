import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildIssueBrief } from "../src/brief.js";
import { runCli } from "../src/cli.js";

describe("buildIssueBrief", () => {
  it("creates a focused issue triage brief", () => {
    const brief = buildIssueBrief({
      repo: "openai/codex",
      number: 42,
      title: "Crash when reviewing a pull request",
      body: "Steps: open a PR, start review, see crash.",
      labels: ["bug", "needs-triage"],
    });

    assert.match(brief, /^# Codex OSS Maintenance Brief/);
    assert.match(brief, /Repository: openai\/codex/);
    assert.match(brief, /Issue: #42/);
    assert.match(brief, /Labels: bug, needs-triage/);
    assert.match(brief, /Triage this issue and propose the smallest safe next step\./);
    assert.match(brief, /Classification: bug, feature, question, docs, or maintenance\./);
  });

  it("uses an explicit placeholder when the issue body is blank", () => {
    const brief = buildIssueBrief({
      repo: "openai/codex",
      title: "Document review workflow",
      body: "   ",
    });

    assert.match(brief, /No issue body provided\./);
  });

  it("fails fast with the invalid repo value", () => {
    assert.throws(
      () =>
        buildIssueBrief({
          repo: "",
          title: "Document review workflow",
        }),
      /repo must be a non-empty string; received ""/
    );
  });
});

describe("runCli", () => {
  it("prints an issue brief from command line flags", () => {
    const writes = [];
    const code = runCli(
      [
        "issue",
        "--repo",
        "openai/codex",
        "--number",
        "7",
        "--title",
        "Needs release checklist",
        "--body",
        "Release notes are missing.",
        "--label",
        "maintenance",
      ],
      {
        stdout: { write: (value) => writes.push(value) },
        stderr: { write: () => {} },
      }
    );

    assert.equal(code, 0);
    assert.match(writes.join(""), /Issue: #7/);
    assert.match(writes.join(""), /Release notes are missing\./);
  });

  it("returns a non-zero code when required flags are missing", () => {
    const errors = [];
    const code = runCli(["issue", "--repo", "openai/codex"], {
      stdout: { write: () => {} },
      stderr: { write: (value) => errors.push(value) },
    });

    assert.equal(code, 1);
    assert.match(errors.join(""), /--title must be a non-empty string/);
  });
});
