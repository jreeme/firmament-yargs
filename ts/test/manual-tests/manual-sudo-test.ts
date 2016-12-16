import 'reflect-metadata';
import kernel from '../../inversify.config';
import {Spawn} from "../../interfaces/spawn";
import {IPostal} from "../../interfaces/postal";
import {CommandUtil} from "../../interfaces/command-util";
let spawn = kernel.get<Spawn>('Spawn');
let postal = kernel.get<IPostal>('IPostal');
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
