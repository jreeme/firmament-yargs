import {SafeJson, SafeJsonResult} from '..';
import {injectable} from 'inversify';
import * as jsonfile from 'jsonfile';

const safeJsonParseCallback = require('safe-json-parse/callback');
const safeJsonParseTuple = require('safe-json-parse/tuple');

@injectable()
export class SafeJsonImpl implements SafeJson {
  safeParse(jsonString: string, cb: (err: Error, obj: any) => void) {
    safeJsonParseCallback(jsonString, cb);
  }

  safeParseSync(jsonString: string): SafeJsonResult {
    let tuple = safeJsonParseTuple(jsonString);
    return {err: tuple[0], obj: tuple[1]};
  }

  readFile(filename: string, options: any, cb: (err: Error, obj: any) => void): any {
    return jsonfile.readFile(filename, options, cb);
  }

  readFileSync(filename: string, options: any): any {
    return jsonfile.readFileSync(filename, options);
  }

  writeFile(filename: string, obj: any, options: any, cb: (err: Error) => void): any {
    return jsonfile.writeFile(filename, obj, options, cb);
  }

  writeFileSync(filename: string, obj: any, options: any): any {
    return jsonfile.writeFileSync(filename, obj, options);
  }
}
