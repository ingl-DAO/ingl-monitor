import { Controller } from '@nestjs/common';
import { Body, Post, Req } from '@nestjs/common/decorators';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { User, UserAuthDto } from 'src/Mongo/mongo.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './local/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @UseGuards(LocalGuard)
  async getUsers(@Req() request) {
    const accessToken = this.authService.login(request.user as User);
    return { access_token: accessToken, user: request.user };
  }

  @Post('register')
  async register(@Body() user: UserAuthDto) {
    return this.authService.signUp(user);
  }
}
