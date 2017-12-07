import * as Koa from 'koa';
import * as KoaBody from 'koa-body';
import * as KoaRouter from 'koa-router';
import * as KoaSend from 'koa-send';
import * as Faker from 'faker';
import * as Nodemailer from 'nodemailer';

import { MyLogger } from "./mylogger";
const log = MyLogger.create("App");

interface ManualTaskData {
  role: string;
  organisation: string;
  link: string;
}

// Creates and configures an ExpressJS web server.
export class App {
  // create reusable transporter object using the default SMTP transport
  private transporter = Nodemailer.createTransport({
    host: 'mail.univie.ac.at',
    port: 25,
    secure: false, // true for 465, false for other ports
  });

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

    //manual: customerSendsOrder
    router.get('/customerSendsOrder', async (ctx, next) => {
      log.info(ctx.path);
      await KoaSend(ctx, '/static/customerSendsOrder.html');
      next();
    });
    router.post('/customerSendsOrder', KoaBody(), async (ctx, next) => {
      let data: ManualTaskData = ctx.request.body;
      log.info("role: %s", data.role);
      ctx.body = Faker.fake("{{name.lastName}}, {{name.firstName}} {{name.suffix}}")
      // ctx.type = 'application/json';
      next();
    });

    //manual: customerSendsSpecification
    router.get('/customerSendsSpecification', async (ctx, next) => {
      await KoaSend(ctx, '/static/customerSendsSpecification.html');
      next();
    });
    router.post('/customerSendsSpecification', KoaBody(), async (ctx, next) => {
      let data: ManualTaskData = ctx.request.body;
      // ctx.type = 'application/json';      
      ctx.body = Faker.random.arrayElement(["VodkaBar", "WhiskeyBar", "BeerBar", "SakeBar", "TequillaBar"]);
      next();
    });

    //auto: buildBaseModel
    router.get('/buildBaseModel', async (ctx, next) => {
      await KoaSend(ctx, '/static/buildBaseModel.html');
      next();
    });
    router.post('/buildBaseModel', KoaBody(), async (ctx, next) => {
      log.info("buildBaseModel: %s", ctx.request.body);
      let amount: number = ctx.request.body['amount'];
      //do something
      ctx.body = {success: {}};
      next();
    });

    //auto: orderSeats
    router.post('/orderSeats', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order Seats!', text: 'Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: orderToilet
    router.post('/orderToilet', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order Toilet!', text: 'Toilet Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: orderVodkaBar
    router.post('/orderVodkaBar', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order VodkaBar!', text: 'VodkaBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: orderWhiskeyBar
    router.post('/orderWhiskeyBar', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order WhiskeyBar!', text: 'WhiskeyBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: orderTequillaBar
    router.post('/orderTequillaBar', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order TequillaBar!', text: 'TequillaBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: orderBeerBar
    router.post('/orderBeerBar', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order BeerBar!', text: 'BeerBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: orderSakeBar
    router.post('/orderSakeBar', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order BeerBar!', text: 'BeerBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.body = {success: {}};
      next();
    });

    //auto: waitForParts
    router.post('/waitForParts', KoaBody(), async (ctx, next) => {      
      ctx.body = {success: {}};
      next();
    });

    //auto: assemblePlane
    router.post('/assemblePlane', async (ctx, next) => {
      ctx.body = {success: {}};
      next();
    });

    //manual: testFlight
    router.get('/testFlight', async (ctx, next) => {
      await KoaSend(ctx, '/static/testFlight.html');
      next();
    });
    router.post('/testFlight', async (ctx, next) => {
      ctx.body=Faker.random.number({min:100,max:3600});
      next();
    });

    //manual: evaluateFlight
    router.get('/evaluateFlight', async (ctx, next) => {
      await KoaSend(ctx, '/static/evaluateFlight.html');
      next();
    });
    router.post('/evaluateFlight', async (ctx, next) => {
      ctx.body = Faker.random.arrayElement(["true", "false"]);
      next();
    });

    //manual: repair
    router.get('/repair', async (ctx, next) => {
      await KoaSend(ctx, '/static/repair.html');
      next();
    });
    router.post('/repair', async (ctx, next) => {
      ctx.body = Faker.random.arrayElement(["body", "avionics", "radio", "engine"]);
      next();
    });

    //auto: deliverPlane
    router.get('/deliverPlane', async (ctx, next) => {
      await KoaSend(ctx, '/static/deliverPlane.html');
      next();
    });
    router.post('/deliverPlane', async (ctx, next) => {
      ctx.body = Faker.random.arrayElement(["true", "false"]);
      next();
    });

    //auto: receiveConfirmation
    router.get('/receiveConfirmation', async (ctx, next) => {
      await KoaSend(ctx, '/static/receiveConfirmation.html');
      next();
    });
    router.post('/receiveConfirmation', async (ctx, next) => {
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
