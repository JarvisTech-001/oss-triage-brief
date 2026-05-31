#!/usr/bin/env node

import { readFileSync } from "node:fs";

import { buildIssueBrief } from "./brief.js";

export function runCli(argv = process.argv.slice(2), streams = {}) {
  const stdout = streams.stdout ?? process.stdout;
  const stderr = streams.stderr ?? process.stderr;

  try {
    const [command, ...args] = argv;

    if (command === undefined || command === "--help" || command === "-h") {
      stdout.write(usage());
      return 0;
    }

    if (command !== "issue") {
      throw new Error(`unknown command ${JSON.stringify(command)}`);
    }

    const flags = parseFlags(args);
    const body = flags.bodyFile === undefined ? flags.body : readFileSync(flags.bodyFile, "utf8");
    const brief = buildIssueBrief({
      repo: requireCliString(flags.repo, "--repo"),
      number: flags.number,
      title: requireCliString(flags.title, "--title"),
      body,
      labels: flags.label,
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
  const repeatedFlags = new Set(["label"]);

  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];

    if (flag === undefined || !flag.startsWith("--")) {
      throw new Error(`expected a flag, received ${JSON.stringify(flag)}`);
    }

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`${flag} requires a value`);
    }

    const name = flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!["repo", "number", "title", "body", "bodyFile", "label"].includes(name)) {
      throw new Error(`unknown flag ${flag}`);
    }

    if (repeatedFlags.has(name)) {
      flags[name] = [...(flags[name] ?? []), value];
    } else {
      flags[name] = value;
    }
  }

  return flags;
}

function requireCliString(value, flag) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${flag} must be a non-empty string; received ${JSON.stringify(value)}`);
  }

  return value;
}

function usage() {
  return [
    "Usage:",
    "  codex-oss issue --repo owner/name --title \"Issue title\" [--number 123] [--body text] [--body-file path] [--label bug]",
    "",
  ].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = runCli();
}
