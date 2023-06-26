import path from "node:path";
import { pipeline } from "node:stream/promises"
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib"

import normalizePath from "../helpers/normalizePath.js";

export class ZLibController {
  #commands;

  constructor() {
    this.#commands = {
      "compress": this.#compress,
      "decompress": this.#decompress
    }
  }

  #compress = async (pathToTarget, pathToDestination) => {
    const targetPath = normalizePath(pathToTarget);
    let destinationPath = normalizePath(pathToDestination);

    let isDirectory = false;
    try {
      isDirectory = (await stat(destinationPath)).isDirectory();
    } catch (error) {
    }

    if (isDirectory) {
      const filename = path.basename(targetPath);
      destinationPath = path.join(destinationPath, filename + ".br");
    } else {
      destinationPath += ".br";
    }

    await pipeline(createReadStream(targetPath),
      createBrotliCompress(),
      createWriteStream(destinationPath)
    );


  }

  #decompress = async (pathToTarget, pathToDestination) => {
    const targetPath = normalizePath(pathToTarget);
    let destinationPath = normalizePath(pathToDestination);

    let isDirectory = false;
    try {
      isDirectory = (await stat(destinationPath)).isDirectory();
    } catch (error) {
    }

    if (isDirectory) {
      const { name } = path.parse(targetPath);
      destinationPath = path.join(destinationPath, name);
    }

    await pipeline(createReadStream(targetPath),
      createBrotliDecompress(),
      createWriteStream(destinationPath)
    );
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