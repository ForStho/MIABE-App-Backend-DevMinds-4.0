import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SwaggerAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('Swagger documentation requires authentication');
        }

        const [type, credentials] = authHeader.split(' ');
        if (type !== 'Basic' || !credentials) {
            throw new UnauthorizedException('Invalid authentication scheme');
        }

        const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
        const [username, password] = decoded.split(':');

        const swaggerUser = this.configService.get<string>('SWAGGER_USER', 'admin');
        const swaggerPass = this.configService.get<string>('SWAGGER_PASSWORD', 'swagger123');

        if (username !== swaggerUser || password !== swaggerPass) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return true;
    }
}