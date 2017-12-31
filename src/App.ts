import * as Koa from 'koa';
import * as KoaBody from 'koa-body';
import * as KoaRouter from 'koa-router';
import * as KoaSend from 'koa-send';
import * as Faker from 'faker';
import * as Nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as xml2js from 'xml2js'

import { MyLogger } from "./mylogger";
import * as Request from 'request';
const log = MyLogger.create("App");

interface ManualTaskData {
  role: string;
  organisation: string;
  link: string;
  timeout: number;
}

// header: {"cpee-base":"http://coruscant.wst.univie.ac.at:9298",
// "cpee-instance":"http://coruscant.wst.univie.ac.at:9298/145",
// "cpee-callback":"http://coruscant.wst.univie.ac.at:9298/145/callbacks/4e044959171bd005c81cc3f8e235a216",
// "cpee-callback_id":"4e044959171bd005c81cc3f8e235a216",
// "cpee-activity":"a1",
// "cpee-label":"\"Customer sends Order\"",
// "cpee-attr-uuid":"88633ba5-ffc2-44c4-83e6-d53b56500771",
// "cpee-attr-info":"a00626177",
// "cpee-attr-modeltype":"CPEE",
// "cpee-attr-theme":"default",
// "accept-encoding":"gzip;q=1.0,deflate;q=0.6,identity;q=0.3",
// "accept":"*/*","user-agent":"Ruby",
// "content-type":"application/x-www-form-urlencoded","content-length":"106","host":"faljse.info:9666"}
class CpeeInfo {
  'cpee-base': string
  'cpee-instance': string
  'cpee-callback': string
  'cpee-callback_id': string
  'cpee-activity': string
  'cpee-label': string
  'cpee-attr-uuid': string
  'cpee-attr-info': string
  'cpee-attr-modeltype': string
  'cpee-attr-theme': string
}

class CallbackData {
  headers=new  Map<string, CpeeInfo>();
  data=new  Map<string, ManualTaskData>();
}

class TaskInfo {
  label: string
  callBackId: string
  callBack: string
  link: string
  role: string
  timeout: number
  assignedTo: string
  assignedTimestamp: number = 0
}

class WorkList {
  tasks= new Map<string, TaskInfo[]>();
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
  private workList=new WorkList();
  private ci = new CallbackData();
  private template;
  private organisation;

  //Run configuration methods on the Express instance.
  constructor(private port) {
    this.routes();
    this.koa.on('error', this.onError);
    this.koa.on('listening', this.onListening);
  }

  public async init() {
    log.info("init");
    let orgxml = fs.readFileSync('organisation.xml', 'utf8');
    xml2js.parseString(orgxml, (err, result) => {
      this.organisation=result.organisation;
    });

    this.template = fs.readFileSync('a00626177.xml', 'utf8');
    this.koa.listen(this.port);
  }

  // Configure API endpoints.
  private routes(): void {
    let router = new KoaRouter();

    router.get('/', async (ctx, next) => {
      await KoaSend(ctx, '/static/index.html');
      next();
    });

    router.get('/worklist/:user?', async (ctx, next) => {
      log.info(ctx.path);
      let ts = new Date().getTime();
      ctx.type = 'application/json';
      let user = ctx.params['user'];
      let subjects=this.organisation.subjects[0];
      let role="";
      for(let subject of subjects.subject) {
        let name = subject.$['id'];
        if(name===user) {
          role = subject.relation[0].$['role'];
          let unit = subject.relation[0].$['unit'];
        }
      }
      if(role === undefined||role == ""||role == "root") {
        let allTasks = [];
        for (let pair of this.workList.tasks) {
          allTasks.push(...pair[1]);
        }
        ctx.body = JSON.stringify(allTasks);
      }
      else {
        let list=[]
        if(this.workList.tasks.get(role) !== undefined) {
          for(let task of this.workList.tasks.get(role)) {
            if(task.assignedTimestamp + (10*1000) < ts ) {
              list.push(task);
            }
          }
        }
        ctx.body = JSON.stringify(list);
      }
      next();
    });

    router.put('/take', KoaBody(), async (ctx, next) => {
      log.info(ctx.path);
      let userName = ctx.request.body['userName'];
      let callBackId = ctx.request.body['callBackId'];
      let ts = new Date().getTime();
      for (let pair of this.workList.tasks) {
        for(let task of pair[1]) {
          if(task.callBackId === callBackId)
            task.assignedTo = userName;
            task.assignedTimestamp = ts;
          }
      }
      ctx.body = "";
      next();
    });

    router.put('/finish', KoaBody(), async (ctx, next) => {
      log.info(ctx.path);
      let userName = ctx.request.body['userName'];
      let callBackId = ctx.request.body['callBackId'];
      let ts = new Date().getTime();
      for (let pair of this.workList.tasks) {
        for(let i=0; i<pair[1].length;i++) {
          if(pair[1][i].callBackId==callBackId) {
            pair[1].splice(i,1);
          }
        }
      }
      ctx.body = "";
      next();
    });

    router.get('/organisation', async (ctx, next) => {
      log.info(ctx.path);
      ctx.body = JSON.stringify(this.organisation);
      next();
    });

    router.get('/start', async (ctx, next) => {
      var formData = {
        xml: {
          value: this.template,
          options: {
            filename: 'filename.xml',
            contentType: 'text/xml'
          }
        }
      };
      Request.post({ url: 'http://cpee.org', formData: formData }, function optionalCallback(err, httpResponse, body) {
        if (err) {
          console.log('upload failed:' + err);
          ctx.body='upload failed:' + err;
        }
        else {
          console.log('Upload successful!  Server responded with:' + body);
          ctx.body='Upload successful!  Server responded with:' + body
        }
        next()
      });
    });

    //manual: customerSendsOrder
    // 2017-12-28T21:26:31.599Z - info: [App] role: {"timeout":"2","role":"customer","organisation":"acme corp","link":"http://faljse.info:9666/customerSendsOrder"}
    router.post('/receive', KoaBody(), async (ctx, next) => {
      let data: ManualTaskData = ctx.request.body;
      log.info("data: %s ", JSON.stringify(data));
      log.info("header: %s ", JSON.stringify(ctx.request.header));
      ctx.type = 'application/json';
      let a:CpeeInfo = ctx.request.header;
      let id:string=a['cpee-callback_id'];
      this.ci.headers.set(id, ctx.request.header)
      this.ci.data.set(id, data)

      let taskList=this.workList.tasks.get(data.role);
      if(taskList===undefined) {
        taskList=[];
        this.workList.tasks.set(data.role, taskList);
      }      
        
      let task=new TaskInfo();
      task.callBackId=a['cpee-callback_id']
      task.callBack=a['cpee-callback']
      task.label=a['cpee-label']
      task.link=data.link
      task.role=data.role
      task.timeout=data.timeout
      taskList.push(task);
      ctx.set('CPEE-CALLBACK', 'true')
      ctx.body = JSON.stringify(ctx.body = {
        name: Faker.fake("{{name.lastName}}, {{name.firstName}} {{name.suffix}}")
      });
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
      ctx.type = 'application/json';      
      ctx.body = JSON.stringify({
        build: "success"
      })
      next();
    });

    //auto: orderSeats
    router.post('/orderSeats', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      log.info("orderSeats amount: %d",amount);
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order Seats!', text: 'Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: orderToilet
    router.post('/orderToilet', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      log.info("orderToilet amount: %d",amount);
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order Toilet!', text: 'Toilet Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: orderVodkaBar
    router.post('/orderVodkaBar', KoaBody(), async (ctx, next) => {
      let amount: number = ctx.request.body['amount'];
      log.info("orderVodkaBar");
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order VodkaBar!', text: 'VodkaBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: orderWhiskeyBar
    router.post('/orderWhiskeyBar', KoaBody(), async (ctx, next) => {
      log.info("orderWhiskeyBar");
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
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: orderTequillaBar
    router.post('/orderTequillaBar', KoaBody(), async (ctx, next) => {
      log.info("orderTequillaBar");
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
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: orderBeerBar
    router.post('/orderBeerBar', KoaBody(), async (ctx, next) => {
      log.info("orderBeerBar");
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
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: orderSakeBar
    router.post('/orderSakeBar', KoaBody(), async (ctx, next) => {
      log.info("orderSakeBar");
      let amount: number = ctx.request.body['amount'];
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Order SakeBar!', text: 'SakeBar Amount:' + amount
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {notified:notify}});
      next();
    });

    //auto: waitForParts
    router.post('/waitForParts', KoaBody(), async (ctx, next) => { 
      log.info("waitForParts");
      await this.sleep(4000);
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {arrived:true}});
      next();
    });

    //auto: assemblePlane
    router.post('/assemblePlane', KoaBody(), async (ctx, next) => {
      log.info("assemblePlane");
      await this.sleep(4000);
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({success: {ready:true}});
      next();
    });



    //auto: deliverPlane
    router.get('/deliverPlane', async (ctx, next) => {
      await KoaSend(ctx, '/static/deliverPlane.html');
      next();
    });
    router.post('/deliverPlane', KoaBody(), async (ctx, next) => {
      let from: string = ctx.request.body['from'];
      let notify: string = ctx.request.body['notify'];
      let mailOptions = {
        from: from, to: notify,
        subject: 'Plane invoice', text: 'Customers invoice'
      };
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) { return log.warn(error.message); }
      });

      ctx.body = JSON.stringify({delivered: Faker.random.arrayElement(["true", "false"])});
      next();
    });

    //auto: receiveConfirmation
    router.get('/receiveConfirmation', async (ctx, next) => {
      await KoaSend(ctx, '/static/receiveConfirmation.html');
      next();
    });
    router.post('/receiveConfirmation', KoaBody(), async (ctx, next) => {
      await this.sleep(2000); //wait for confirmation
      ctx.body = JSON.stringify({confirmed: Faker.random.arrayElement(["true", "false"])});
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
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
}
