import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User, UserAuthDto } from 'src/Mongo/mongo.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { LocalGuard } from './local/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @UseGuards(LocalGuard)
  async getUsers(@Req() request: Request) {
    const accessToken = this.authService.login(request.user as User);
    return { access_token: accessToken, user: request.user };
  }

  @Post('register')
  async register(@Body() user: UserAuthDto) {
    return this.authService.signUp(user);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() request: Request) {
    return request.user;
  }
}
