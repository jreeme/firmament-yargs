//Provides a way to set interface methods to always thrown an error. Good for testing.
export interface ForceError {
  forceError: boolean;
  forceException: boolean;
  forceExceptionWaitCount: number;
  throwException();
  checkForceError(message: string, cb?: (err: Error, res: any) => void): boolean;
  checkCallback(cb: (err: Error, anything: any, anything2: any) => void): (err: Error, anything: any, anything2: any) => void;
}
