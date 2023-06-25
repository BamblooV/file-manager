import { cwd } from "node:process";
import path from "node:path";
import { createHash } from 'node:crypto';
import { readFile } from "node:fs/promises";

class HashController {

  #rl;
  #commands;

  constructor(readline) {
    this.#rl = readline;
    this.#commands = {
      "hash": this.#hashFile
    }
  }

  #hashFile = async (pathToFile) => {
    const targetPath = path.isAbsolute(pathToFile) ? path.normalize(pathToFile) : path.join(cwd(), pathToFile);

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
          this.#rl.write(data + "\n\n");
        }
      } catch (error) {
        this.#rl.write('Operation failed\n');
      }
    } else {
      this.#rl.write('Invalid input\n');
    }
  }

}

export default HashController