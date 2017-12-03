import * as http from 'http';
import { App } from './App';
import * as fs from "fs";
import { MyLogger } from "./mylogger";
const log = MyLogger.create("index.ts");

export class Config {
    port: number;
}
export class Global{
  static config: Config;
}

let server;
async function main() {
  Global.config = JSON.parse(fs.readFileSync('config.json',"utf8"));
  const port:number = +normalizePort(process.env.PORT || Global.config.port || 9666);  
  log.info(`listening on ${port}`);
  let app = new App(port);
  await app.init();
}

function normalizePort(val: number | string): number | string | boolean {
  let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
  if (isNaN(port)) return val;
  else if (port >= 0) return port;
  else return false;
}

main();