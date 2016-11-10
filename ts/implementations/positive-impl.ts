import {injectable} from 'inversify';
import {Positive} from "../interfaces/positive";
const positive = require('positive');

@injectable()
export class PositiveImpl implements Positive {
  areYouSure(confirmMsg: string, cancelMsg: string, defaultAnswer: boolean = false): boolean {
    let retVal = positive(confirmMsg, defaultAnswer);
    if (!retVal) {
      console.error(cancelMsg);
    }
    return retVal;
  }
}
