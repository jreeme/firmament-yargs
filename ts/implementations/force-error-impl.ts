import {injectable} from 'inversify';
import {ForceError} from "../interfaces/force-error";
@injectable()
export class ForceErrorImpl implements ForceError {
  forceError: boolean = false;

  //noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
  checkForceError(message: string, cb: (err: Error, res: any)=>void = null): boolean {
    if (this.forceError && typeof cb === 'function') {
      cb(new Error(`force error: ${message}`), null);
    }
    return this.forceError;
  }

  checkCallback(cb: (err: Error, anything: any)=>void): (err: Error, anything: any)=>void {
    return (typeof cb === 'function')
      ? cb
      : () => {
    };
  }
}
