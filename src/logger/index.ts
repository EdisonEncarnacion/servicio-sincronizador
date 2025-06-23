import { LoggerService } from './logger.service';
export { LoggerService } from './logger.service';
export const logger = new LoggerService();
export type AppLogger = typeof logger;