import {ForceError} from '../force-error';
import {RemoteCatalog} from './remote-catalog';
import {Url} from 'url';
import {RemoteCatalogResource} from "./remote-catalog-resource";

export interface RemoteCatalogGetter extends ForceError {
  getCatalogFromUrl(url: Url | string, cb: (err: Error, remoteCatalog: RemoteCatalog) => void);

  getRemoteResource(url: Url | string,
                    parentCatalogEntryName: string,
                    cb: (err: Error, remoteCatalogResource?: RemoteCatalogResource) => void);

  resolveTextResourceFromUrl(url: Url | string, cb: (err: Error, text: string, absoluteUrl?: string) => void);

  resolveJsonObjectFromUrl(url: Url | string, cb: (err: Error, jsonObject: any, absoluteUrl: string) => void);

  getParsedUrl(url: Url | string, cb: (err: Error, parsedUrl: Url) => void);
}

