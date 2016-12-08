import {Container} from 'inversify';
import {ProgressBar} from "./interfaces/progress-bar";
import {ProgressBarImpl} from "./implementations/progress-bar-impl";
import {CommandLine} from "./interfaces/command-line";
import {CommandLineImpl} from "./implementations/command-line-impl";
import {CommandUtilImpl} from "./implementations/command-util-impl";
import {NestedYargs} from "./interfaces/nested-yargs-wrapper";
import {NestedYargsImpl} from "./implementations/nested-yargs-wrapper-impl";
import {Spawn} from "./interfaces/spawn";
import {SpawnImpl} from "./implementations/spawn-impl";
import {CommandUtil} from "./interfaces/command-util";
import {CommandImpl} from "./implementations/command-impl";
import {Command} from "./interfaces/command";
import {Positive} from "./interfaces/positive";
import {PositiveImpl} from "./implementations/positive-impl";
import {ProgressTaskImpl} from "./implementations/progress-task-impl";
import {ProgressTask} from "./interfaces/progress-task";
var kernel = new Container();
kernel.bind<ProgressTask>('ProgressTask').to(ProgressTaskImpl);
kernel.bind<ProgressBar>('ProgressBar').to(ProgressBarImpl).inSingletonScope();
kernel.bind<CommandLine>('CommandLine').to(CommandLineImpl);
kernel.bind<NestedYargs>('NestedYargs').to(NestedYargsImpl);
kernel.bind<CommandUtil>('CommandUtil').to(CommandUtilImpl);
kernel.bind<Command>('CommandImpl').to(CommandImpl);
kernel.bind<Spawn>('Spawn').to(SpawnImpl);
kernel.bind<Positive>('Positive').to(PositiveImpl);
export default kernel;
