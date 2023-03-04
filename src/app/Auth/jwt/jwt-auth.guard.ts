import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest<Request>();
    return (
      result &&
      (process.env.NODE_ENV === 'production'
        ? request.user['baseUrl'] === new URL(request.headers.origin).hostname
        : request.user['localUrl'] === request.headers.origin)
    );
  }
}
