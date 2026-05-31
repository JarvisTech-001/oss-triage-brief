import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildIssueBrief, buildPullRequestBrief } from "../src/brief.js";
import { runCli } from "../src/cli.js";

describe("buildIssueBrief", () => {
  it("creates a focused issue triage brief", () => {
    const brief = buildIssueBrief({
      repo: "example/project",
      number: 42,
      title: "Crash when reviewing a pull request",
      body: "Steps: open a PR, start review, see crash.",
      labels: ["bug", "needs-triage"],
    });

    assert.match(brief, /^# OSS Maintainer Brief/);
    assert.match(brief, /Repository: example\/project/);
    assert.match(brief, /Issue: #42/);
    assert.match(brief, /Labels: bug, needs-triage/);
    assert.match(brief, /Triage this issue and propose the smallest safe next step\./);
    assert.match(brief, /Classification: bug, feature, question, docs, or maintenance\./);
  });

  it("uses an explicit placeholder when the issue body is blank", () => {
    const brief = buildIssueBrief({
      repo: "example/project",
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

describe("buildPullRequestBrief", () => {
  it("creates a focused pull request review brief", () => {
    const brief = buildPullRequestBrief({
      repo: "example/project",
      number: 18,
      title: "Add release checklist",
      body: "Adds a release checklist command.",
      base: "main",
      head: "release-checklist",
      changedFiles: ["src/cli.js", "test/brief.test.js"],
    });

    assert.match(brief, /^# OSS Maintainer Brief/);
    assert.match(brief, /Pull request: #18/);
    assert.match(brief, /Base branch: main/);
    assert.match(brief, /Head branch: release-checklist/);
    assert.match(brief, /Changed files:\n- src\/cli\.js\n- test\/brief\.test\.js/);
    assert.match(brief, /Review this pull request for maintainer acceptance\./);
  });
});

describe("runCli", () => {
  it("prints an issue brief from command line flags", () => {
    const writes = [];
    const code = runCli(
      [
        "issue",
        "--repo",
        "example/project",
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

  it("prints a pull request brief from command line flags", () => {
    const writes = [];
    const code = runCli(
      [
        "pr",
        "--repo",
        "example/project",
        "--number",
        "12",
        "--title",
        "Add review command",
        "--body",
        "Adds a review command for maintainers.",
        "--base",
        "main",
        "--head",
        "review-command",
        "--changed-file",
        "src/cli.js",
      ],
      {
        stdout: { write: (value) => writes.push(value) },
        stderr: { write: () => {} },
      }
    );

    assert.equal(code, 0);
    assert.match(writes.join(""), /Pull request: #12/);
    assert.match(writes.join(""), /Changed files:\n- src\/cli\.js/);
  });

  it("returns a non-zero code when required flags are missing", () => {
    const errors = [];
    const code = runCli(["issue", "--repo", "example/project"], {
      stdout: { write: () => {} },
      stderr: { write: (value) => errors.push(value) },
    });

    assert.equal(code, 1);
    assert.match(errors.join(""), /--title must be a non-empty string/);
  });
});
