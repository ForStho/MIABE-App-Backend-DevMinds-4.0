// src/common/decorators/throttle.decorator.ts
import { SetMetadata } from '@nestjs/common';

export interface ThrottleOptions {
    limit: number;
    ttl: number;
}

export const Throttle = (options: ThrottleOptions) =>
    SetMetadata('throttle', options);