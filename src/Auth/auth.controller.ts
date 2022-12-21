import { Controller } from '@nestjs/common';
import { Post, Req } from '@nestjs/common/decorators';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { User } from 'src/services/user.service';
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
}
