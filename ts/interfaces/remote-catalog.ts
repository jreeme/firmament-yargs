import {Url} from 'url';
import {ForceError} from "./force-error";

export interface RemoteCatalogResource {
  name: string;
  parentCatalogEntryName: string;
  absoluteUrl: string,
  text: string;
  parsedObject: any;
}

export interface RemoteCatalogEntry {
  name: string;
  urls: string[];
  resources: RemoteCatalogResource[];
}

export interface RemoteCatalog {
  entries: RemoteCatalogEntry[];
}

export interface RemoteCatalogGetter extends ForceError {
  getCatalogFromUrl(url: Url|string, cb: (err: Error, remoteCatalog: RemoteCatalog) => void);
  resolveTextResourceFromUrl(url: Url|string, cb: (err: Error, text: string, absoluteUrl?: string) => void);
  resolveJsonObjectFromUrl(url: Url|string, cb: (err: Error, jsonObject: any, absoluteUrl: string) => void);
}
