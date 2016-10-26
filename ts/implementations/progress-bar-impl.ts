import {ProgressBar} from "../interfaces/progress-bar";
import {injectable} from 'inversify';
/*const multimeter = require('pm2-multimeter');
 const multi = multimeter(process);*/
@injectable()
export class ProgressBarImpl implements ProgressBar {
  private config = {
    width: 40,
    before: '[',
    after: ']',
    solid: {background: 'blue', foreground: 'white', text: '|'},
    empty: {background: null, foreground: null, text: ' '}
  };
  private progressBarMap = {};
  private offset: number = 0;

  public showProgressForTask(id: string, status: string, current: number, total: number) {
    //TODO: Quick and dirty implementation. Try to get 'pm2-multimeter' working someday.
    let msg = '> ' + current.toLocaleString() + ' : ' + total.toLocaleString();// + id);
    console.log(msg);
    /*    let bar = this.progressBarMap[id];
     if (!bar) {
     multi.offset++;
     this.progressBarMap[id] = bar = multi.rel(1, this.offset++, this.config);
     console.log('> ' + current.toLocaleString() + ' : ' + total.toLocaleString());// + id);
     }
     status = ' ** ' + id + ': ' + status + '                    ';
     bar.ratio(current, total, status);*/
  }
}
