import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from "node:os";

import parseArgs from './helpers/parseArgs.js';


const main = async (args) => {

  const { username } = parseArgs(args);

  const rl = readline.createInterface({ input, output, prompt: `You are currently in ${os.homedir()}\n` });

  rl.write(`Welcome to the File Manager, ${username}!\n`)

  rl.prompt();

  rl
    .on("line", (msg) => {
      console.log(msg);
      rl.prompt();
    })
    .on("SIGINT", () => {
      rl.write(`Thank you for using File Manager, ${username}, goodbye!\n`);
      process.exit(0);
    })

}

await main(process.argv)