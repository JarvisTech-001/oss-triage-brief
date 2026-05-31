#!/usr/bin/env node

import { readFileSync } from "node:fs";

import { buildIssueBrief, buildPullRequestBrief } from "./brief.js";

export function runCli(argv = process.argv.slice(2), streams = {}) {
  const stdout = streams.stdout ?? process.stdout;
  const stderr = streams.stderr ?? process.stderr;

  try {
    const [command, ...args] = argv;

    if (command === undefined || command === "--help" || command === "-h") {
      stdout.write(usage());
      return 0;
    }

    if (!["issue", "pr"].includes(command)) {
      throw new Error(`unknown command ${JSON.stringify(command)}`);
    }

    const flags = parseFlags(args);
    const jsonInput = flags.fromJson ? readJsonFromStdin(streams) : null;
    const body = flags.bodyFile === undefined ? flags.body : readFileSync(flags.bodyFile, "utf8");
    const repo = flags.fromJson ? repoFromGitHubJson(jsonInput, flags) : requireCliString(flags.repo, "--repo");
    const title = flags.fromJson ? requireCliString(jsonInput.title, "title") : requireCliString(flags.title, "--title");
    const brief =
      command === "issue"
        ? buildIssueBrief({
            repo,
            number: flags.fromJson ? numberFromGitHubJson(jsonInput, flags, "issues") : flags.number,
            title,
            body: flags.fromJson ? jsonInput.body : body,
            labels: flags.fromJson ? labelsFromGitHubJson(jsonInput.labels) : flags.label,
          })
        : buildPullRequestBrief({
            repo,
            number: flags.fromJson ? numberFromGitHubJson(jsonInput, flags, "pull") : flags.number,
            title,
            body: flags.fromJson ? jsonInput.body : body,
            base: flags.fromJson ? requireCliString(jsonInput.baseRefName, "baseRefName") : requireCliString(flags.base, "--base"),
            head: flags.fromJson ? requireCliString(jsonInput.headRefName, "headRefName") : requireCliString(flags.head, "--head"),
            changedFiles: flags.fromJson ? changedFilesFromGitHubJson(jsonInput.files) : flags.changedFile,
          });

    stdout.write(`${brief}\n`);
    return 0;
  } catch (error) {
    stderr.write(`${error.message}\n`);
    return 1;
  }
}

function parseFlags(args) {
  const flags = {};
  const booleanFlags = new Set(["fromJson"]);
  const repeatedFlags = new Set(["changedFile", "label"]);

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];

    if (flag === undefined || !flag.startsWith("--")) {
      throw new Error(`expected a flag, received ${JSON.stringify(flag)}`);
    }

    const name = flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!["repo", "number", "title", "body", "bodyFile", "label", "base", "head", "changedFile", "fromJson"].includes(name)) {
      throw new Error(`unknown flag ${flag}`);
    }

    if (booleanFlags.has(name)) {
      flags[name] = true;
      continue;
    }

    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`${flag} requires a value`);
    }

    if (repeatedFlags.has(name)) {
      flags[name] = [...(flags[name] ?? []), value];
    } else {
      flags[name] = value;
    }
    index += 1;
  }

  return flags;
}

function requireCliString(value, flag) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${flag} must be a non-empty string; received ${JSON.stringify(value)}`);
  }

  return value;
}

function readJsonFromStdin(streams) {
  const text = streams.stdinText ?? readFileSync(0, "utf8");

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`--from-json must receive valid JSON; ${error.message}`);
  }
}

function repoFromGitHubJson(jsonInput, flags) {
  if (flags.repo !== undefined) {
    return requireCliString(flags.repo, "--repo");
  }

  if (typeof jsonInput.repository?.nameWithOwner === "string") {
    return requireCliString(jsonInput.repository.nameWithOwner, "repository.nameWithOwner");
  }

  const match = githubUrlParts(jsonInput.url);
  if (match === null) {
    throw new TypeError(`repo could not be inferred from url; received ${JSON.stringify(jsonInput.url)}`);
  }

  return `${match.owner}/${match.repo}`;
}

function numberFromGitHubJson(jsonInput, flags, type) {
  if (flags.number !== undefined) {
    return flags.number;
  }

  if (jsonInput.number !== undefined) {
    return jsonInput.number;
  }

  const match = githubUrlParts(jsonInput.url);
  if (match === null || match.type !== type) {
    throw new TypeError(`number could not be inferred from url; received ${JSON.stringify(jsonInput.url)}`);
  }

  return match.number;
}

function githubUrlParts(url) {
  if (typeof url !== "string") {
    return null;
  }

  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)(?:[/?#].*)?$/);
  if (match === null) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
    type: match[3],
    number: match[4],
  };
}

function labelsFromGitHubJson(labels) {
  if (labels === undefined || labels === null) {
    return [];
  }

  if (!Array.isArray(labels)) {
    throw new TypeError(`labels must be an array; received ${JSON.stringify(labels)}`);
  }

  return labels.map((label) => (typeof label === "string" ? label : label.name));
}

function changedFilesFromGitHubJson(files) {
  if (files === undefined || files === null) {
    return [];
  }

  if (!Array.isArray(files)) {
    throw new TypeError(`files must be an array; received ${JSON.stringify(files)}`);
  }

  return files.map((file) => (typeof file === "string" ? file : file.path));
}

function usage() {
  return [
    "Usage:",
    "  oss-triage-brief issue --repo owner/name --title \"Issue title\" [--number 123] [--body text] [--body-file path] [--label bug]",
    "  gh issue view 123 --json url,title,body,labels | oss-triage-brief issue --from-json",
    "  oss-triage-brief pr --repo owner/name --title \"PR title\" --base main --head feature [--number 123] [--body text] [--changed-file path]",
    "  gh pr view 123 --json url,title,body,baseRefName,headRefName,files | oss-triage-brief pr --from-json",
    "",
  ].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
