import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { writeFile, rename, rm, stat } from "node:fs/promises"
import path from "node:path"
import { cwd } from "node:process";
import { pipeline } from "node:stream/promises";

import normalizePath from "../helpers/normalizePath.js";

class FileController {

  #commands;

  constructor() {
    this.#commands = {
      "cat": this.#readFile,
      "add": this.#createEmptyFile,
      "rn": this.#renameFile,
      "cp": this.#copyFile,
      "mv": this.#moveFile,
      "rm": this.#removeFile,
    }
  }

  #readFile = async (pathToTarget) => {
    const target = normalizePath(pathToTarget);

    if (!existsSync(target)) {
      throw new Error("File doesn't exist");
    }

    return new Promise((res, rej) => {
      const rs = createReadStream(target);
      const result = [];
      rs.on('data', (data) => {
        result.push(data.toString());
      })
      rs.on('end', () => res(result.join('\n')));
    })
  }

  #createFile = async (fileName, data) => {
    const filePath = path.join(cwd(), fileName);

    if (existsSync(filePath)) {
      throw new Error("File already exist");
    }

    await writeFile(filePath, data);
  }

  #createEmptyFile = async (fileName) => {
    await this.#createFile(fileName, '');
  }

  #renameFile = async (pathToFile, newFileName) => {
    const target = normalizePath(pathToFile);
    const { dir } = path.parse(target);

    const destination = path.resolve(dir, newFileName);

    if (!existsSync(target)) {
      throw new Error("File doesn't exist");
    }

    if (existsSync(destination)) {
      throw new Error("File already exist");
    }

    await rename(target, destination);
  }

  #copyFile = async (pathToTarget, pathToDestination) => {
    const target = normalizePath(pathToTarget);
    const { base } = path.parse(target);
    let destination = normalizePath(pathToDestination);

    if (!existsSync(target)) {
      throw new Error("File doesn't exist");
    }

    const isDir = (await stat(destination)).isDirectory();

    if (!isDir) {
      throw new Error("Second argument should be path to a directory");
    }

    destination = path.join(destination, base);

    if (existsSync(destination)) {
      throw new Error("File already exist");
    }

    await pipeline(
      createReadStream(target),
      createWriteStream(destination)
    )
  }

  #moveFile = async (pathToTarget, pathToDestination) => {
    const target = normalizePath(pathToTarget);
    const destination = normalizePath(pathToDestination);

    await this.#copyFile(target, destination);
    await this.#removeFile(target);
  }

  #removeFile = async (pathToTarget) => {
    const target = normalizePath(pathToTarget);
    await rm(target, { force: true });
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

export default FileController;