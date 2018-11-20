import {injectable} from 'inversify';
import {ForceError} from '..';

@injectable()
export class ForceErrorImpl implements ForceError {
  forceError = false;
  forceException = false;
  forceExceptionWaitCount = 0;

  throwException() {
    if(!this.forceException || this.forceExceptionWaitCount) {
      return --this.forceExceptionWaitCount;
    }
    throw new Error('forceException');
  }

  checkForceError(message: string, cb: (err: Error, anything: any, anything2?: any) => void = null): boolean {
    if(this.forceError && typeof cb === 'function') {
      cb(new Error(`force error: ${message}`), null, null);
    }
    return this.forceError;
  }

  checkCallback(cb: (err: Error, anything: any, anything2?: any) => void): (err: Error, anything: any, anything2?: any) => void {
    return (typeof cb === 'function')
      ? cb
      : () => {
      };
  }
}
