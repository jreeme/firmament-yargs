import {SpawnOptions} from "child_process";
export interface Command {
  aliases: string[];
  command: string;
  commandDesc: string;
  handler: (argv:any)=>void;
  options: any;
  subCommands: Command[];
  spawnShellCommand(command:string, args:string[], options:SpawnOptions, cb:(err:Error, result:any)=>void);
}
