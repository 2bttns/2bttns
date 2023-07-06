#!/usr/bin/env node

import fs, { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import got from "got";
import { tmpdir } from "os";
import { join } from "path";
import { Stream } from "stream";
import tar from "tar";
import { promisify } from "util";

// Set this to null to use the default branch of the repo, or specify a branch of the repo
const CURRENT_BRANCH: string | null = null;

const pipeline = promisify(Stream.pipeline);

main();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("No arguments provided. Aborting.");
    return;
  }

  const targetDir = args[0];
  const cwd = process.cwd();
  try {
    fs.accessSync(cwd, fs.constants.W_OK);
  } catch {
    console.error(
      `Missing write permissions for current directory: ${cwd}. Aborting.`
    );
    return;
  }

  if (!existsSync(join(cwd, targetDir))) {
    mkdirSync(targetDir, { recursive: false });
  }

  let repoName: string;
  let fullRepoName: string;
  let defaultBranch: string;
  try {
    const repoInfo = await got("https://api.github.com/repos/2bttns/2bttns");
    const repoInfoJson = JSON.parse(repoInfo.body);
    repoName = repoInfoJson?.name; // This should be `2bttns`
    if (!repoName) {
      throw new Error(
        "2bttns repo `full_name` not found. Are you connected to the internet? Aborting."
      );
    }

    fullRepoName = repoInfoJson?.full_name; // This should be `2bttns/2bttns`
    if (!fullRepoName) {
      throw new Error(
        "2bttns repo `full_name` not found. Are you connected to the internet? Aborting."
      );
    }

    defaultBranch = repoInfoJson?.default_branch; // This should be `main` or whatever the default branch is named in case it changes in the future.
    if (!defaultBranch) {
      throw new Error(
        "2bttns repo `default_branch` not found. Are you connected to the internet? Aborting."
      );
    }
  } catch (error) {
    console.error(error);
    return;
  }

  if (targetDir === ".") {
    console.log(`Initializing 2bttns app in current directory...`);
  } else {
    console.log(`Initializing 2bttns app at ${targetDir}...`);
  }

  const targetBranch = CURRENT_BRANCH ?? defaultBranch;
  const downloadUrl = `https://codeload.github.com/${fullRepoName}/tar.gz/${targetBranch}`;

  let tempFile: string | null = null;
  try {
    tempFile = await downloadTar(downloadUrl);

    await tar.x({
      file: tempFile,
      cwd: targetDir,
      strip: 2,
      filter: (p) => p.includes(`2bttns-${targetBranch}/app`),
    });
    console.log("Successfully initialized 2bttns app!");
  } catch (error) {
    console.error("Failed to initialize 2bttns app. Aborting.");
    console.error(error);
    return;
  } finally {
    if (tempFile) {
      unlinkSync(tempFile);
    }
  }
}

export async function downloadTar(url: string) {
  const tempFile = join(tmpdir(), `2bttns.c2a.temp-${Date.now()}`);
  await pipeline(got.stream(url), createWriteStream(tempFile));
  return tempFile;
}
