import {injectable} from 'inversify';
import {Positive, FailureRetVal} from "../interfaces/positive";
const positive = require('positive');

@injectable()
export class PositiveImpl implements Positive {
  areYouSure(confirmMsg: string,
             cancelMsg: string,
             defaultAnswer: boolean = false,
             failureRetVal: FailureRetVal = FailureRetVal.NOT_SET): boolean {
    let retVal = true;
    try {
      //This call to positive() will throw an exception if under test because no '/dev/tty' is available
      retVal = positive(confirmMsg, defaultAnswer);
    } catch (err) {
      //failureRetVal should be set if code is under test. If it's not set then return defaultAnswer
      retVal = (failureRetVal !== FailureRetVal.NOT_SET)
        ? failureRetVal === FailureRetVal.TRUE
        : defaultAnswer;
    }
    if (!retVal) {
      console.error(cancelMsg);
    }
    return retVal;
  }
}
