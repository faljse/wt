import * as Winston from 'winston';
import { Logger, transports } from 'winston';

export class MyLogger {
    public static create(label: string): Winston.LoggerInstance {
        let logger = new Winston.Logger({
            transports: [
                new (Winston.transports.Console)({
                    level: 'info',
                    colorize: true,
                    prettyPrint: true,
                    timestamp: true,
                    label: label
                }),
                // new (Winston.transports.File)({ filename: 'somefile.log' })
            ]
        });
        return logger;
    }
}