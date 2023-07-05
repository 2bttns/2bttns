#!/usr/bin/env node

import fs, { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import got from "got";
import { tmpdir } from "os";
import { join } from "path";
import { Stream } from "stream";
import tar from "tar";
import { promisify } from "util";

const pipeline = promisify(Stream.pipeline);

main();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("No arguments provided");
    return;
  }

  const targetDir = args[0];
  const cwd = process.cwd();
  try {
    fs.accessSync(cwd, fs.constants.W_OK);
  } catch {
    console.error(`Missing write permissions for current directory: ${cwd}`);
    return;
  }

  if (!existsSync(join(cwd, targetDir))) {
    mkdirSync(targetDir, { recursive: false });
  }

  console.log(`Initializing 2bttns app at ${targetDir}...`);

  // TODO: Use actual public repo app/ folder when we publish it
  const downloadUrl =
    "https://codeload.github.com/2bttns/2bttns-sdk/tar.gz/main";

  let tempFile: string | null = null;
  try {
    tempFile = await downloadTar(downloadUrl);

    await tar.x({
      file: tempFile,
      cwd: targetDir,
      // TODO: Update strip params based on public app/ repo folder structure
      strip: 1,
      filter: (p) => p.includes(`2bttns-sdk-main/src`),
    });
    console.log("Successfully initialized 2bttns app!");
  } catch (error) {
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
