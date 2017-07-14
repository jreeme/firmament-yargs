#!/usr/bin/env node
import 'reflect-metadata';
import kernel from '../../inversify.config';
import {RemoteCatalogGetter} from "../../interfaces/remote-catalog/remote-catalog-getter";
//const templateCatalogUrl = '/home/jreeme/src/firmament-docker/docker/templateCatalog.json';
const templateCatalogUrl = 'https://raw.githubusercontent.com/jreeme/firmament-docker/master/docker/templateCatalog.json';
const remoteCatalogGetter = kernel.get<RemoteCatalogGetter>('RemoteCatalogGetter');
process.on('uncaughtException', err => {
  console.log(err);
});

/*remoteCatalogGetter.getCatalogFromUrl(templateCatalogUrl, (err, remoteCatalog) => {
  let e = err;
});*/
remoteCatalogGetter.resolveJsonObjectFromUrl(templateCatalogUrl, (err, jsonObject) => {
  let e = err;
});

