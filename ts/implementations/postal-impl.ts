import {injectable} from "inversify";
import {
  IPostal, ICallback, IConfiguration, IChannelDefinition, ISubscriptionDefinition,
  IEnvelope
} from "../interfaces/postal";

const _postal: IPostal = require('postal');

@injectable()
export class PostalImpl implements IPostal {
  get configuration(): IConfiguration {
    return _postal.configuration;
  }

  set configuration(newConfiguration: IConfiguration) {
    _postal.configuration = newConfiguration;
  }

  set subscriptions(newSubscriptions: any) {
    _postal.subscriptions = newSubscriptions;
  }

  get subscriptions() {
    return _postal.subscriptions;
  }

  set wireTaps(newWireTaps: ICallback<any>[]) {
    _postal.wireTaps = newWireTaps;
  }

  get wireTaps(): ICallback<any>[] {
    return _postal.wireTaps;
  }

  addWireTap(callback: ICallback<any>): ()=>void {
    return _postal.addWireTap(callback);
  }

  channel<T>(name?: string): IChannelDefinition<T> {
    return _postal.channel(name);
  }

  getSubscribersFor(): ISubscriptionDefinition<any>[];
  getSubscribersFor(options: {channel?: string; topic?: string; context?: any}): ISubscriptionDefinition<any>[];
  getSubscribersFor(predicateFn: (sub: ISubscriptionDefinition<any>)=>boolean): ISubscriptionDefinition<any>[];
  getSubscribersFor(options?): ISubscriptionDefinition<any>[] {
    return _postal.getSubscribersFor(options);
  }

  publish(envelope: IEnvelope<any>): void {
    _postal.publish(envelope);
  }

  reset(): void {
    _postal.reset();
  }

  subscribe(options: {channel?: string; topic: string; callback: ICallback<any>}): ISubscriptionDefinition<any> {
    return _postal.subscribe(options);
  }

  unsubscribe(sub: ISubscriptionDefinition<any>): void {
    _postal.unsubscribe(sub);
  }

  unsubscribeFor(): void;
  unsubscribeFor(options: {channel?: string; topic?: string; context?: any}): void;
  unsubscribeFor(options?: {channel?: string; topic?: string; context?: any}): void {
    _postal.unsubscribeFor(options);
  }
}
