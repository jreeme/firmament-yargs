import {ForceError} from './force-error';

export interface SafeJsonResult {
  err: Error;
  obj: any;
}

export interface SafeJson extends ForceError {
  safeParse(jsonString: string, cb: (err: Error, obj: any) => void);
  safeParseSync(jsonString: string): SafeJsonResult;

  readFile(filename: string, cb: (err: Error, obj: any) => void);
  readFile(filename: string, options: any, cb?: (err: Error, obj: any) => void): any;

  readFileSync(filename: string): any;
  readFileSync(filename: string, options?: any): any;

  writeFile(filename: string, obj: any, cb: (err: Error) => void): any;
  writeFile(filename: string, obj: any, options: any, cb?: (err: Error) => void): any;

  writeFileSync(filename: string, obj: any): any;
  writeFileSync(filename: string, obj: any, options?: any): any;
}
