export interface Positive {
  areYouSure(confirmMsg: string, cancelMsg: string, defaultAnswer?: boolean): boolean;
}
