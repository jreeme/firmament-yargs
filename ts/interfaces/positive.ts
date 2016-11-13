export enum FailureRetVal {
  NOT_SET,
  TRUE,
  FALSE
}
export interface Positive {
  areYouSure(confirmMsg: string, cancelMsg: string, defaultAnswer?: boolean, failureRetVal?: FailureRetVal): boolean;
}
