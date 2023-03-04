import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { BetaAccess } from './beta-access/beta-access.schema';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { LocalGuard } from './local/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @UseGuards(LocalGuard)
  async singIn(@Req() request: Request) {
    const accessToken = this.authService.signIn(request.user as BetaAccess);
    return { access_token: accessToken };
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() request: Request) {
    return request.user;
  }
}
