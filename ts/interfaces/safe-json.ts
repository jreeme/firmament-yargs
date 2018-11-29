export interface SafeJsonResult {
  err: Error;
  obj: any;
}

export interface SafeJson {
  safeParse(jsonString: string, cb: (err: Error, obj: any) => void);
  safeParseSync(jsonString: string): SafeJsonResult;
  readFile(filename: string, options: any, cb: (err: Error, obj: any) => void): any;
  readFileSync(filename: string, options: any): any;
  writeFile(filename: string, obj: any, options: any, cb: (err: Error) => void): any;
  writeFileSync(filename: string, obj: any, options: any): any;
}

