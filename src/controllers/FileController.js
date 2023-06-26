import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { readFile, writeFile, rename, rm, stat } from "node:fs/promises"
import path from "node:path"
import { cwd } from "node:process";
import { pipeline } from "node:stream/promises";

import normalizePath from "../helpers/normalizePath.js";

export class FileController {

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
    pathToTarget = normalizePath(pathToTarget);
    const data = await readFile(pathToTarget, { encoding: "utf-8" });
    return data;
  }

  #createFile = async (fileName, data) => {
    filePath = path.join(cwd(), fileName);

    if (existsSync(filePath)) {
      throw new Error("File already exist");
    }

    writeFile(filePath, data);
  }

  #createEmptyFile = async (fileName) => {
    this.#createFile(fileName, '');
  }

  #renameFile = async (pathToFile, newFileName) => {
    pathToFile = normalizePath(pathToFile);
    const { dir } = path.parse(pathToFile);

    newFileName = path.join(dir, newFileName);

    if (!existsSync(pathToFile)) {
      throw new Error("File doesn't exist");
    }

    if (existsSync(newFileName)) {
      throw new Error("File already exist");
    }

    await rename(pathToFile, newFileName);
  }

  #copyFile = async (pathToTarget, pathToDestination) => {
    pathToTarget = normalizePath(pathToTarget);
    pathToDestination = normalizePath(pathToDestination);

    if (!existsSync(pathToTarget)) {
      throw new Error("File doesn't exist");
    }

    if (existsSync(pathToDestination)) {
      throw new Error("File already exist");
    }

    await pipeline(
      createReadStream(pathToTarget),
      createWriteStream(pathToDestination)
    )
  }

  #moveFile = async (pathToTarget, pathToDestination) => {
    pathToTarget = normalizePath(pathToTarget);
    const { base } = path.parse(pathToTarget);
    pathToDestination = normalizePath(pathToDestination);

    if (!existsSync(pathToTarget)) {
      throw new Error("File doesn't exist");
    }

    const isDir = (await stat(pathToDestination)).isDirectory();

    if (!isDir) {
      throw new Error("Second argument should be path to a directory");
    }

    pathToDestination = path.join(pathToDestination, base);

    if (existsSync(pathToDestination)) {
      throw new Error("File already exist");
    }

    await this.#copyFile(pathToTarget, pathToDestination);
    await this.#removeFile(pathToTarget);
  }

  #removeFile = async (pathToTarget) => {
    pathToTarget = normalizePath(pathToTarget);
    await rm(pathToTarget, { force: true });
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