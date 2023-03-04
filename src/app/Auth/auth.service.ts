import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProgramUsage } from '../program/program.schema';
import { BetaAccess } from './beta-access/beta-access.schema';
import { BetaAccessService } from './beta-access/beta-access.service';

@Injectable()
export class AuthService {
  constructor(
    private betaAccessService: BetaAccessService,
    private jwtService: JwtService
  ) {}

  async validateCode(usage: ProgramUsage, accessCode: string) {
    return this.betaAccessService.getAccess(usage, accessCode);
  }

  signIn({ baseUrl, localUrl, usage }: BetaAccess) {
    return this.jwtService.sign({ baseUrl, localUrl, usage });
  }
}
