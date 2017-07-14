import {ForceError} from '../force-error';
import {RemoteCatalog} from './remote-catalog';
import {Url} from 'url';
export interface RemoteCatalogGetter extends RemoteCatalogGetterTest, ForceError {
  getCatalogFromUrl(url: Url | string, cb: (err: Error, remoteCatalog: RemoteCatalog) => void);
  resolveTextResourceFromUrl(url: Url | string, cb: (err: Error, text: string, absoluteUrl?: string) => void);
  resolveJsonObjectFromUrl(url: Url | string, cb: (err: Error, jsonObject: any, absoluteUrl: string) => void);
}
export interface RemoteCatalogGetterTest {
  getParsedUrl(url: Url | string): Url;
}
