//"outDir": "/home/jreeme/tmp/firmament-docker/node_modules/firmament-yargs/js",
import 'reflect-metadata';//Need these globals for inversify
export * from './interfaces/safe-json';
export * from './interfaces/crypton';
export * from './interfaces/postal';
export * from './interfaces/command';
export * from './interfaces/command-util';
export * from './interfaces/spawn';
export * from './interfaces/command-line';
export * from './interfaces/progress-bar';
export * from './interfaces/progress-task';
export * from './interfaces/positive';
export * from './interfaces/force-error';
export * from './interfaces/remote-catalog';
export * from './implementations/force-error-impl';
export * from './custom-typings';
import kernel from "./inversify.config";
export {kernel};

//HACK so tools can get version to sync the firmament ecosystem
if(process.argv[2] && process.argv[2].toString() === '--version'){
  let package_json = require('../package.json');
  console.log(`${package_json.name}: ${package_json.version}`);
}
