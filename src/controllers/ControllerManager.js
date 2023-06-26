import FileController from "./FileController.js";
import HashController from "./HashController.js";
import NavigationController from "./NavigationController.js";
import OSController from "./OSController.js";
import ZLibController from "./ZLibController.js";

class ControllerManager {

  #os;
  #navigator;
  #hash;
  #zlib;
  #file;
  #controllers;

  constructor(readline) {
    this.#os = new OSController();
    this.#navigator = new NavigationController(readline);
    this.#hash = new HashController();
    this.#zlib = new ZLibController();
    this.#file = new FileController();
    this.#controllers = [
      this.#os,
      this.#navigator,
      this.#hash,
      this.#zlib,
      this.#file
    ]
  }

  #parseArgs(consoleInput) {
    const result = [];

    let isQuoted = false;

    let wordStart = 0;

    for (let i = 0; i < consoleInput.length; i++) {
      const char = consoleInput[i];

      if (char === `'` || char === `"`) {
        if (!isQuoted) {
          wordStart = i + 1;
        } else {
          const word = consoleInput.slice(wordStart, i);

          wordStart = i + 1;

          if (word.length > 0) {
            result.push(word);
          }
        }

        isQuoted = !isQuoted;
        continue;
      }

      if (!isQuoted && char === " " || char === "\t") {
        const word = consoleInput.slice(wordStart, i);

        wordStart = i + 1;

        if (word.length > 0) {
          result.push(word);
        }
      }
    }

    if (wordStart !== consoleInput.length) {
      result.push(consoleInput.slice(wordStart));
    }

    return result;
  }

  async processCommand(consoleInput) {
    const [command, ...args] = this.#parseArgs(consoleInput);

    let isProcessed = false;

    for (let i = 0; i < this.#controllers.length; i++) {
      const controller = this.#controllers[i];

      if (await controller.canProcess(command)) {
        try {
          await controller.processCommand(command, args);
          isProcessed = true;
        } catch (error) {
          console.log("Operation failed");
        }
        break;
      }

    }

    if (!isProcessed) {
      console.log("Invalid input");
    }
  }
}

export default ControllerManager;