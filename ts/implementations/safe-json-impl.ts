import {injectable} from 'inversify';
import {ForceErrorImpl, SafeJson, SafeJsonResult} from '..';
import * as jsonfile from 'jsonfile';

const safeJsonParseCallback = require('safe-json-parse/callback');
const safeJsonParseTuple = require('safe-json-parse/tuple');

@injectable()
export class SafeJsonImpl extends ForceErrorImpl implements SafeJson {
  constructor() {
    super();
  }

  safeParse(jsonString: string, cb: (err: Error, obj: any) => void) {
    const me = this;
    cb = me.checkCallback(cb);
    if(me.checkForceError('SafeJsonImpl.safeParse', cb)) {
      return;
    }
    try {
      me.throwException();
      safeJsonParseCallback(jsonString, cb);
    } catch(err) {
      cb(err, undefined);
    }
  }

  safeParseSync(jsonString: string): SafeJsonResult {
    let tuple = safeJsonParseTuple(jsonString);
    return {err: tuple[0], obj: tuple[1]};
  }

  readFile(filename: string, cb: (err: Error, obj: any) => void);
  readFile(filename: string, options: any, cb?: (err: Error, obj: any) => void): any {
    return jsonfile.readFile(filename, options, cb);
  }

  readFileSync(filename: string): any;
  readFileSync(filename: string, options?: any): any {
    return jsonfile.readFileSync(filename, options);
  }

  writeFile(filename: string, obj: any, cb: (err: Error) => void): any;
  writeFile(filename: string, obj: any, options: any, cb?: (err: Error) => void): any {
    return jsonfile.writeFile(filename, obj, options, cb);
  }

  writeFileSync(filename: string, obj: any): any;
  writeFileSync(filename: string, obj: any, options?: any): any {
    return jsonfile.writeFileSync(filename, obj, options);
  }
}
