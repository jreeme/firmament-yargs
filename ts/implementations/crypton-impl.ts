import {Crypton} from "../interfaces/crypton";
import {injectable} from "inversify";
const shorthash = require('shorthash');
@injectable()
export class CryptonImpl implements Crypton {
  string2JSIdHash(inputString: string): string {
    return `A${shorthash.unique(inputString)}`;
  }
}
