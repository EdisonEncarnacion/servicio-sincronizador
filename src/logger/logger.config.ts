
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { DailyRotateFile } from 'winston/lib/winston/transports';
import { getNowTimestamp } from '../utils/date.utils';

export const createWinstonLogger = (): winston.Logger => {
    return winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(({ level, message }) =>
                        `${getNowTimestamp()} [${level}] ${message}`,
                    ),
                ),
            }),
            new DailyRotateFile({
                level: 'info',
                dirname: 'logs/info',
                filename: 'application-info-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '10m',
                format: winston.format.combine(
                    winston.format((info) => (info.level === 'info' ? info : false))(),
                    winston.format.printf(({ level, message }) =>
                        `${getNowTimestamp()} [${level}] ${message}`,
                    ),
                ),
            }),
            new DailyRotateFile({
                level: 'error',
                dirname: 'logs/error',
                filename: 'application-error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '10m',
                format: winston.format.printf(({ level, message }) =>
                    `${getNowTimestamp()} [${level}] ${message}`,
                ),
            }),
        ],
    });
};
