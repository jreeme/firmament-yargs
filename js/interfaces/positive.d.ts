export declare enum FailureRetVal {
    NOT_SET = 0,
    TRUE = 1,
    FALSE = 2,
}
export interface Positive {
    areYouSure(confirmMsg: string, cancelMsg: string, defaultAnswer?: boolean, failureRetVal?: FailureRetVal): boolean;
}
