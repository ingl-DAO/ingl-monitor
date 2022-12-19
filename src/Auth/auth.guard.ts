import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { Request } from 'express';

export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return request.isAuthenticated();
  }
}
