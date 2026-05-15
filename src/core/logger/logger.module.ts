import { Module, DynamicModule, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LOGGER_MODULE_OPTIONS } from './logger.constants';

export interface LoggerModuleOptions {
  level?: string;
  format?: 'json' | 'pretty';
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options?: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useValue: options ?? {},
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
