import {ProgressTask} from "../interfaces/progress-task";
import {injectable} from "inversify";

@injectable()
export class ProgressTaskImpl implements ProgressTask {
  id: string;
  msg: string;
  //noinspection JSUnusedGlobalSymbols
  current: number;
  //noinspection JSUnusedGlobalSymbols
  total: number;
  statusItem: any;
}
