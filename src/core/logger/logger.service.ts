import { Inject, Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { LOGGER_MODULE_OPTIONS } from './logger.constants';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(
    private configService: ConfigService,
    @Inject(LOGGER_MODULE_OPTIONS) private options: any,
  ) {
    const isProduction = this.configService.get('app.nodeEnv') === 'production';
    const logLevel =
      this.options.level || this.configService.get('app.logLevel', 'info');
    const format = this.options.format || (isProduction ? 'json' : 'pretty');

    const winstonFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format((info) => {
        // Ajoute un correlationId s'il existe dans le contexte asynchrone
        const store = (global as any).asyncLocalStorage?.getStore();
        if (store?.correlationId) {
          info.correlationId = store.correlationId;
        }
        return info;
      })(),
      format === 'json' ? winston.format.json() : winston.format.prettyPrint(),
    );

    this.logger = winston.createLogger({
      level: logLevel,
      format: winstonFormat,
      defaultMeta: { service: 'backend-starter' },
      transports: [new winston.transports.Console()],
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  /**
   * Crée un logger enfant avec des métadonnées supplémentaires (ex: correlationId).
   */
  child(meta: Record<string, any>): winston.Logger {
    return this.logger.child(meta);
  }
}
