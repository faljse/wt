import * as Koa from 'koa';
import * as KoaBody from 'koa-body';
import * as KoaRouter from 'koa-router';
import * as KoaSend from 'koa-send';

import { MyLogger } from "./mylogger";
const log = MyLogger.create("App");

// Creates and configures an ExpressJS web server.
export class App {
  private koa = new Koa();
  //Run configuration methods on the Express instance.
  constructor(private port) {
    this.routes();
    this.koa.on('error', this.onError);
    this.koa.on('listening', this.onListening);
  }

  public async init() {
    log.info("init");
    this.koa.listen(this.port);
  }

  // Configure API endpoints.
  private routes(): void {
    let router = new KoaRouter();

    router.get('/', async (ctx, next) => {
      await KoaSend(ctx, '/static/index.html');
      next();
    });
    router.get('/customerSendsOrder', async (ctx, next) => {
      log.info(ctx.path);
      await KoaSend(ctx, '/static/customerSendsOrder.html');
      next();
    });
    router.post('/customerSendsOrder', KoaBody(), async (ctx, next) => {
      ctx.body = JSON.stringify(ctx.request.body);    
      ctx.type = 'application/json';
      next();
    });
    router.get('/customerSendsSpecification', async (ctx, next) => {
      await KoaSend(ctx, '/static/customerSendsOrder.html');      
      next();
    });
    router.get('/buildBaseModel', async (ctx, next) => {
      await KoaSend(ctx, '/static/buildBaseModel.html');      
      next();
    });
    router.get('/orderSeats', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderSeats.html');      
      next();
    });
    router.get('/orderToilet', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderToilet.html');      
      next();
    });
    router.get('/orderVodkaBar', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderVodkaBar.html');      
      next();
    });
    router.get('/orderWhiskeyBar', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderWhiskeyBar.html');      
      next();
    });
    router.get('/orderTequillaBar', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderTequillaBar.html');      
      next();
    });
    router.get('/orderBeerBar', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderBeerBar.html');      
      next();
    });
    router.get('/orderSakeBar', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderBeerBar.html');      
      next();
    });
    router.get('/waitForParts', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderBeerBar.html');      
      next();
    });
    router.get('/assemblePlane', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderBeerBar.html');      
      next();
    });
    router.get('/testFlight', async (ctx, next) => {
      await KoaSend(ctx, '/static/orderBeerBar.html');      
      next();
    });
    router.get('/evaluateFlight', async (ctx, next) => {
      await KoaSend(ctx, '/static/evaluateFlight.html');      
      next();
    });
    router.get('/repair', async (ctx, next) => {
      await KoaSend(ctx, '/static/repair.html');      
      next();
    });
    router.get('/deliverPlane', async (ctx, next) => {
      await KoaSend(ctx, '/static/deliverPlane.html');      
      next();
    });
    router.get('/receiveConfirmation', async (ctx, next) => {
      await KoaSend(ctx, '/static/receiveConfirmation.html');      
      next();
    });
    router.get('/static/*', async (ctx, next) => {
      log.info(ctx.path);
      await KoaSend(ctx, ctx.path);
      next();
    });
    this.koa.use(router.routes())
    this.koa.use(router.allowedMethods());
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  private onListening() {
    let addrs = this.koa.context.ips;
    for (let addr in addrs) {
      let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr}`;
      log.info(`Listening on ${bind}`);
    }
  }
}
