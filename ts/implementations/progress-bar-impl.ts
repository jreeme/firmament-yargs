import {ProgressBar} from "../interfaces/progress-bar";
import {injectable, inject} from 'inversify';
import {CommandUtil} from "../interfaces/command-util";
import kernel from "../inversify.config";
import {ProgressTask} from "../interfaces/progress-task";
import * as _ from 'lodash';

const status = require('node-status');

@injectable()
export class ProgressBarImpl implements ProgressBar {
  private commandUtil: CommandUtil;
  private tasks: ProgressTask[] = [];
  private started: boolean = false;
  private patternBase: string = '{uptime.green} {spinner.cyan}';
  private pattern: string = '';

  constructor(@inject('CommandUtil')_commandUtil: CommandUtil) {
    this.commandUtil = _commandUtil;
  }

  public showProgressForTask(id: string, msg: string, current: number, total: number) {
    const console = status.console();

    let task = _.find(this.tasks, ['id', id]);
    if (!task) {
      if (current >= total) {
        return;
      }
      task = kernel.get<ProgressTask>('ProgressTask');
      this.tasks.push(task);
      task.id = id;
      task.msg = msg;
      task.statusItem = status.addItem(id, {
        max: total,
        count: current
      });
    } else {
      if (current >= total) {
        status.removeItem(task.id);
        _.remove(this.tasks, t => {
          return task.id == t.id;
        });
      } else {
        task.statusItem.count = current;
        task.statusItem.max = total;
      }
    }
    this.render();
  }

  private render() {
    let pattern = this.patternBase;
    if(!this.tasks.length){
      status.stop();
      status.clear();
      this.started = false;
      return;
    }
    this.tasks.forEach(task => {
      pattern += ` | ${task.msg} {${task.id}.green.bar}`;
    });
    if (this.started) {
      if (this.pattern == pattern) {
        return;
      }
      status.setPattern(this.pattern = pattern);
    } else {
      this.started = true;
      status.start({
        pattern
      });
    }
  }
}
