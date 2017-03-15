export interface SafeJsonResult {
  err: Error;
  obj: any;
}

export interface SafeJson {
  safeParse(jsonString: string, cb: (err: Error, obj: any) => void);
  safeParseSync(jsonString: string): SafeJsonResult;
}

