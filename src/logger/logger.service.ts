import * as winston from 'winston';
import { createWinstonLogger } from './logger.config';
import { ILoggerService } from './interface-logger.service';


export class LoggerService implements ILoggerService {
    private readonly logger: winston.Logger;
    constructor() {
        this.logger = createWinstonLogger();
    }
    log(message: string, context?: string) {
        this.logger.info(message, { context });
    }
    error(message: string, trace?: string, context?: string) {
        this.logger.error(message, { trace, context });
    }
    warn(message: string, context?: string) {
        this.logger.warn(message, { context });
    }
    debug(message: string, context?: string) {
        this.logger.debug(message, { context });
    }
}
