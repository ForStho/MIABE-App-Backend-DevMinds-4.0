import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BruteForceService } from './brute-force.service';

@Injectable()
export class BruteForceGuard implements CanActivate {
  constructor(private bruteForceService: BruteForceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const identifier = request.body.email || request.ip; // Par exemple
    const blocked = await this.bruteForceService.isBlocked(identifier);
    if (blocked) {
      throw new HttpException(
        'Too many attempts, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
