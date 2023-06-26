import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from "node:os";

import parseArgs from './helpers/parseArgs.js';
import ControllerManager from './controllers/ControllerManager.js';

const main = async (args) => {

  let { username } = parseArgs(args);

  if (!username) {
    username = "user";
  }

  const rl = readline.createInterface({ input, output, prompt: `\nYou are currently in ${os.homedir()}\n` });
  const manager = new ControllerManager(rl);

  console.log(`Welcome to the File Manager, ${username}!\n\n`)
  rl.prompt();

  rl
    .on("line", async (msg) => {

      if (msg === ".exit") {
        rl.emit("SIGINT");
      }

      await manager.processCommand(msg);
      rl.prompt();
    })
    .on("SIGINT", () => {
      console.log(`Thank you for using File Manager, ${username}, goodbye!\n\n`);
      process.exit(0);
    })
}

await main(process.argv)