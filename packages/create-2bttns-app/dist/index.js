#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs, { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import got from "got";
import { tmpdir } from "os";
import { join } from "path";
import { Stream } from "stream";
import tar from "tar";
import { promisify } from "util";
const pipeline = promisify(Stream.pipeline);
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log("No arguments provided");
            return;
        }
        const targetDir = args[0];
        const cwd = process.cwd();
        try {
            fs.accessSync(cwd, fs.constants.W_OK);
        }
        catch (_a) {
            console.error(`Missing write permissions for current directory: ${cwd}`);
            return;
        }
        if (!existsSync(join(cwd, targetDir))) {
            mkdirSync(targetDir, { recursive: false });
        }
        console.log(`Initializing 2bttns app at ${targetDir}...`);
        // TODO: Use actual public repo app/ folder when we publish it
        const downloadUrl = "https://codeload.github.com/2bttns/2bttns-sdk/tar.gz/main";
        let tempFile = null;
        try {
            tempFile = yield downloadTar(downloadUrl);
            yield tar.x({
                file: tempFile,
                cwd: targetDir,
                // TODO: Update strip params based on public app/ repo folder structure
                strip: 1,
                filter: (p) => p.includes(`2bttns-sdk-main/src`),
            });
            console.log("Successfully initialized 2bttns app!");
        }
        catch (error) {
            console.error(error);
            return;
        }
        finally {
            if (tempFile) {
                unlinkSync(tempFile);
            }
        }
    });
}
export function downloadTar(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const tempFile = join(tmpdir(), `2bttns.c2a.temp-${Date.now()}`);
        yield pipeline(got.stream(url), createWriteStream(tempFile));
        return tempFile;
    });
}
