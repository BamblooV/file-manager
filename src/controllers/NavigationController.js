import os from "node:os";
import path from "node:path";
import { chdir, cwd } from 'node:process';
import fs from "node:fs/promises";
import normalizePath from "../helpers/normalizePath.js";

class NavigationController {

  #rl;
  #commands;

  constructor(readline) {
    this.#rl = readline;
    chdir(os.homedir());
    this.#commands = {
      "up": this.#up,
      "cd": this.#cd,
      "ls": this.#ls
    };
  }

  #up = async () => {
    const newPath = path.join(cwd(), "..");

    chdir(newPath);
    this.#rl.setPrompt(`\nYou are currently in ${cwd()}\n`);
  }

  #cd = async (pathToDir) => {
    const newPath = normalizePath(pathToDir);
    chdir(newPath);
    this.#rl.setPrompt(`\nYou are currently in ${cwd()}\n`);
  }

  #ls = async () => {
    const files = await fs.readdir(cwd(), { withFileTypes: true });

    const dataToDisplay = files.map(dirent => ({
      Name: dirent.name,
      Type: dirent.isDirectory()
        ? "directory"
        : dirent.isFile()
          ? "file"
          : "unknow"
    }))
      .sort((file1, file2) => {
        if (file1.Type === file2.Type) {
          return file1.Name.localeCompare(file2.Name);
        }

        return file1.Type.localeCompare(file2.Type)
      })

    return dataToDisplay;
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
          console.log(data + "\n\n");
        }
      } catch (error) {
        console.log('Operation failed\n');
      }
    } else {
      console.log('Invalid input\n');
    }
  }

}

export default NavigationController