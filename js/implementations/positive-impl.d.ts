import { Positive } from "../interfaces/positive";
export declare class PositiveImpl implements Positive {
    areYouSure(confirmMsg: string, cancelMsg: string, defaultAnswer?: boolean): boolean;
}
