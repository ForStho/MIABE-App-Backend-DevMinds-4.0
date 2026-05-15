// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { RolesGuard } from './guards/roles.guard';
// import { PermissionsGuard } from './guards/permissions.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

// Interceptors
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

// Filters
import { HttpExceptionFilter } from './filters/http-exception.filter';

// Pipes
import { ValidationPipe } from './pipes/validation.pipe';

// Services
import { I18nService } from './services/i18n.service';

// Core (qui contient Redis)
import { CoreModule } from '../core/core.module';

@Global()
@Module({
  imports: [
    CoreModule.forRoot(),     // ← RedisModule est chargé ici
  ],
  providers: [
    JwtAuthGuard,
    RateLimitGuard,
    I18nService,

    // Guards globaux (RateLimitGuard n'est plus global)
    { provide: APP_GUARD, useExisting: JwtAuthGuard },

    // Interceptors
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },

    // Filter & Pipe
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
  exports: [I18nService],
})
export class CommonModule {}