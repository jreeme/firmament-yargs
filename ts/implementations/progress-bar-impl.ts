import {ProgressBar} from "../interfaces/progress-bar";
import {injectable, inject} from 'inversify';
import {CommandUtil} from "../interfaces/command-util";
import kernel from "../inversify.config";
import {ProgressTask} from "../interfaces/progress-task";
import * as _ from 'lodash';
import {IPostal} from "../interfaces/postal";

const status = require('node-status');

@injectable()
export class ProgressBarImpl implements ProgressBar {
  private tasks: ProgressTask[] = [];
  private started: boolean = false;
  private patternBase: string = '{uptime.green} {spinner.cyan}';
  private pattern: string = '';

  constructor(@inject('IPostal') private postal: IPostal) {
    this.postal.subscribe({
      channel: 'ProgressBar',
      topic: 'Stop',
      callback: () => {
        if (this.started) {
          status.stop();
        }
      }
    });
  }

  showProgressForTask(id: string, msg: string, current: number, total: number) {
    this.postal.publish({
      channel: 'CommandUtil',
      topic: 'ProgressBarStarted',
      data: {
        console: status.console()
      }
    });

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
