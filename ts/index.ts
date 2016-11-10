//"outDir": "/home/jreeme/tmp/firmament-docker/node_modules/firmament-yargs/js",
import 'reflect-metadata';//Need these globals for inversify
export * from './interfaces/command';
export * from './interfaces/command-util';
export * from './interfaces/spawn';
export * from './interfaces/command-line';
export * from './interfaces/progress-bar';
export * from './interfaces/positive';
import kernel from "./inversify.config";
export {kernel};

