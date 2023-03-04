import {
  HttpException,
  HttpStatus, Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { isEnum } from 'class-validator';
import { Strategy } from 'passport-local';
import { ProgramUsage } from 'src/app/program/program.schema';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'usage', passwordField: 'accessCode' });
  }

  async validate(usage: string, accessCode: string) {
    if (!isEnum(usage, ProgramUsage))
      throw new HttpException(
        `usage must either be ${ProgramUsage.Maketplace} or ${ProgramUsage.Permissionless}`,
        HttpStatus.BAD_REQUEST
      );
    const user = await this.authService.validateCode(
      usage as ProgramUsage,
      accessCode
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
