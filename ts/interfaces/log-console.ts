export interface LogConsole {
  log(msg: string): void;
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}
