import 'reflect-metadata';
import kernel from '../../inversify.config';
import {Spawn} from "../../interfaces/spawn";
import {IPostal} from "../../interfaces/postal";
import {CommandUtil} from "../../interfaces/command-util";
import {ProgressTask} from "../../interfaces/progress-task";
import {ProgressBar} from "../../interfaces/progress-bar";
let spawn = kernel.get<Spawn>('Spawn');
let postal = kernel.get<IPostal>('IPostal');
let progressBar = kernel.get<ProgressBar>('ProgressBar');
let commandUtil = kernel.get<CommandUtil>('CommandUtil');

commandUtil.log('logging!!');
commandUtil.error('erroring!!');
postal.publish({
  channel: 'CommandUtil',
  topic: 'SuppressConsoleOutput',
  data: {
    suppressConsoleOutput: true
  }
});
commandUtil.log('****logging!!');
commandUtil.error('****erroring!!');
let count = 0;
setTimeout(() => {
  postal.publish({
    channel: 'CommandUtil',
    topic: 'SuppressConsoleOutput',
    data: {
      suppressConsoleOutput: false
    }
  });
}, 3000);
setInterval(() => {
  ++count;
  if (count > 11) {
    process.exit(3);
  }
  progressBar.showProgressForTask('task0', 'hello - status0', count, 10);
  progressBar.showProgressForTask('task1', 'hello - status1', count, 20);
  progressBar.showProgressForTask('task2', 'hello - status2', count, 30);
  commandUtil.log(`muv lee! > ${count}`);
}, 500);
/*postal.subscribe({
 channel: 'hello',
 topic: 'muffLuvin',
 callback: (data, env) => {
 let d = data;
 }
 });

 postal.publish({
 channel: 'hello',
 topic: 'muffLuvin',
 data: {
 shove: 'silo',
 push: 'brennan'
 }
 });
 */

//noinspection JSUnusedLocalSymbols
/*
 spawn.sudoSpawnAsync(['node', '/home/jreeme/src/firmament-yargs/js/test/test-00.js'], null,
 (err, result) => {
 let msg = spawn.commandUtil.returnErrorStringOrMessage(err, result);
 spawn.commandUtil.stdoutWrite(msg);
 },
 (err, result) => {
 spawn.commandUtil.processExitWithError(err, 'OK');
 }
 );
 */
