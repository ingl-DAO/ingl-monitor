import { Controller, Get, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/Auth/jwt/jwt-auth.guard';
import { UserPostDto, UserService } from 'src/services/user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  async getUsers() {
    return this.userService.findAll();
  }

  @Post('new')
  @SetMetadata('isAdmin', true)
  async addNewUser(newUser: UserPostDto) {
    return this.userService.insert(newUser);
  }
}
