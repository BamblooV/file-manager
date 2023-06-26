import { cwd } from "node:process";
import path from "node:path";
import { createHash } from 'node:crypto';
import { readFile } from "node:fs/promises";
import normalizePath from "../helpers/normalizePath.js";
class HashController {

  #commands;

  constructor() {
    this.#commands = {
      "hash": this.#hashFile
    }
  }

  #hashFile = async (pathToFile) => {
    const targetPath = normalizePath(pathToFile);

    const content = await readFile(targetPath, { encoding: 'utf-8' });
    const hashSum = createHash('sha256').update(content, "utf-8");

    return hashSum.digest('hex');
  }

  canProcess(command) {
    return this.#commands.hasOwnProperty(command);
  }

  async processCommand(command, args) {
    const handler = this.#commands[command];
    if (handler.length <= args.length) {
      try {
        const data = await handler(...args);
        if (Array.isArray(data)) {
          console.table(data);
        } else if (typeof data === "string") {
          console.log(data);
        }
      } catch (error) {
        console.log('Operation failed:');
        console.log(error.message)
      }
    } else {
      console.log('Invalid input');
    }
  }
}

export default HashController