import {ProgressTask} from "../interfaces/progress-task";
import {injectable} from "inversify";

@injectable()
export class ProgressTaskImpl implements ProgressTask {
  id: string;
  msg: string;
  current: number;
  total: number;
  statusItem: any;
}
