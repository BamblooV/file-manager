import os from "node:os";

class OSController {

  #commands;

  constructor() {
    this.#commands = {
      "--EOL": this.#getEOL,
      "--cpus": this.#getCPUs,
      "--homedir": this.#getHomeDir,
      "--username": this.#getSysUsername,
      "--architecture": this.#getSysArch,
    };
  }

  #getEOL = () => {
    const EOL = os.EOL;
    return JSON.stringify(EOL);
  }

  #getCPUs = () => {
    const info = os.cpus().map(({ model, speed }) => ({ model: model.trim(), speed: speed / 1000 }));
    return info;
  }

  #getHomeDir = () => {
    return os.homedir();
  }

  #getSysUsername = () => {
    const { username } = os.userInfo();
    return username;
  }

  #getSysArch = () => {
    const arch = os.arch();
    return arch;
  }

  canProcess(command) {
    return command === "os";
  }

  async processCommand(command, args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!this.#commands.hasOwnProperty(arg)) {
        console.log("Invalid input \n");
        return;
      }

      try {
        const data = this.#commands[arg]();

        if (Array.isArray(data)) {
          console.table(data)
        } else {
          console.log(data);
        }
      } catch (error) {
        console.log("Operation failed");
      }
    }
  }
}

export default OSController;