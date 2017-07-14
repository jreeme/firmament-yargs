import {RemoteCatalogResource} from "./remote-catalog-resource";
export interface RemoteCatalogEntry {
  name: string;
  urls: string[];
  resources: RemoteCatalogResource[];
}
