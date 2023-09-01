interface Command {
  execute: (...data: any[]) => Promise<any> | any;
}

class CommandRegistryClass {
  commandsMap: Record<string, Command> = {};

  registerCommand = (commandId: string, command: Command) => {
    if (this.commandsMap[commandId]) {
      return;
    }
    this.commandsMap[commandId] = command;
  };

  executeCommand = async (commandId: string, ...args: any[]) => {
    const command = this.commandsMap[commandId];
    if (!command || !command.execute) return;
    await command.execute(...args);
  };

  deleteCommand = (commandId: string) => {
    const command = this.commandsMap[commandId];
    if (!command) return;
    delete this.commandsMap[commandId];
  };
}

export const CommandRegistry = new CommandRegistryClass();
