import 'reflect-metadata';//Need these globals for inversify
export * from './interfaces/command';
export * from './interfaces/command-line';
export * from './interfaces/progress-bar';
import kernel from "./inversify.config";
export {kernel};

