//Interfaces for the postal NPM package. Lifted directly from @types/postal. I don't know why they didn't export
//them but they didn't so I'm doing it here because I think they're cool and I want to use them.
export interface IConfiguration {
  SYSTEM_CHANNEL: string;
  DEFAULT_CHANNEL: string;
  resolver: IResolver;
}

export interface IResolver {
  compare(binding: string, topic: string, headerOptions: {}): boolean;
  reset(): void;
  purge(options?: {topic?: string, binding?: string, compact?: boolean}): void;
}

export interface ICallback<T> {
  (data: T, envelope: IEnvelope<T>): void
}

export interface ISubscriptionDefinition<T> {
  channel: string;
  topic: string;
  callback: ICallback<T>;

  // after and before lack documentation

  constraint(predicateFn: (data: T, envelope: IEnvelope<T>) => boolean): ISubscriptionDefinition<T>;
  constraints(predicateFns: ((data: T, envelope: IEnvelope<T>) => boolean)[]): ISubscriptionDefinition<T>;
  context(theContext: any): ISubscriptionDefinition<T>;
  debounce(interval: number): ISubscriptionDefinition<T>;
  defer(): ISubscriptionDefinition<T>;
  delay(waitTime: number): ISubscriptionDefinition<T>;
  disposeAfter(maxCalls: number): ISubscriptionDefinition<T>;
  distinct(): ISubscriptionDefinition<T>;
  distinctUntilChanged(): ISubscriptionDefinition<T>;
  logError(): ISubscriptionDefinition<T>;
  once(): ISubscriptionDefinition<T>;
  throttle(interval: number): ISubscriptionDefinition<T>;
  subscribe(callback: ICallback<T>): ISubscriptionDefinition<T>;
  unsubscribe(): void;
}

export interface IEnvelope<T> {
  topic: string;
  data?: T;

  /*Uses DEFAULT_CHANNEL if no channel is provided*/
  channel?: string;

  timeStamp?: string;
}


export interface IChannelDefinition<T> {
  subscribe(topic: string, callback: ICallback<T>): ISubscriptionDefinition<T>;

  publish(topic: string, data?: T): void;

  channel: string;
}

export interface IPostal {
  subscriptions: {};
  wireTaps: ICallback<any>[];

  addWireTap(callback: ICallback<any>): () => void;

  channel<T>(name?: string): IChannelDefinition<T>;

  getSubscribersFor(): ISubscriptionDefinition<any>[];
  getSubscribersFor(options: {channel?: string, topic?: string, context?: any}): ISubscriptionDefinition<any>[];
  getSubscribersFor(predicateFn: (sub: ISubscriptionDefinition<any>) => boolean): ISubscriptionDefinition<any>[];

  publish(envelope: IEnvelope<any>): void;

  reset(): void;

  subscribe(options: {channel?: string, topic: string, callback: ICallback<any>}): ISubscriptionDefinition<any>;
  unsubscribe(sub: ISubscriptionDefinition<any>): void;
  unsubscribeFor(): void;
  unsubscribeFor(options: {channel?: string, topic?: string, context?: any}): void;

  configuration: IConfiguration;
}
