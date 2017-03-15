#!/usr/bin/env node
import 'reflect-metadata';
import kernel from '../../inversify.config';
import {SafeJson} from "../../interfaces/safe-json";

let safeJson = kernel.get<SafeJson>('SafeJson');

process.on('uncaughtException', err => {
  console.log(err);
});

let jsonString = JSON.stringify({a: 'hello', b: 'goodbye', c: {a: 'hi', b: 'bye'}});
let badJsonString = "how now brown cow";

safeJson.safeParse(jsonString, (e, o) => {
  let ee = e;
});

safeJson.safeParse(badJsonString, (e, o) => {
  let ee = e;
});

{
  let {err, obj} = safeJson.safeParseSync(badJsonString);
  let e = err;
}
{
  let {err, obj} = safeJson.safeParseSync(jsonString);
  let e = err;
}
