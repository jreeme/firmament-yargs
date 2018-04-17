import 'reflect-metadata';
import kernel from '../../inversify.config';
import {CommandLine} from "../..";

const commandLine = kernel.get<CommandLine>('CommandLine');


commandLine.printTable([
  {
    Bland: 'Very',
    Scrot: 'Stuben',
    Lorch: 'Plink'
  },
  {
    Bland: 'Very1',
    Scrot: 'Stuben2',
    Lorch: 'Plink3'
  }
]);
