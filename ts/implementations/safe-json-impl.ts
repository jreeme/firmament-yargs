import {SafeJson, SafeJsonResult} from "../interfaces/safe-json";
import {injectable} from "inversify";
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
}
