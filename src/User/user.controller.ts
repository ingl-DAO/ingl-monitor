import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from 'src/Auth/jwt/jwt-auth.guard';
import {
  CollectionName,
  ResetPassword,
  User,
  UserPostDto,
} from 'src/Mongo/mongo.dto';
import { MongoService } from 'src/Mongo/mongo.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private mongoService: MongoService) {}

  @Get('all')
  async getUsers() {
    const users = await this.mongoService.findAll<User>(
      CollectionName.BetaUsers
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, ...user }) => {
      return user;
    });
  }

  @Post('new')
  @SetMetadata('isAdmin', true)
  async addNewUser(@Body() user: UserPostDto) {
    const newUser: Omit<User, '_id'> = {
      ...user,
      password: null,
      is_admin: false,
      created_at: new Date().toISOString(),
      resetPassword: {
        is_used: false,
        reset_link: randomUUID(),
        created_at: new Date().toISOString(),
      },
    };
    await this.mongoService.insert(CollectionName.BetaUsers, { ...newUser });
    return newUser;
  }

  @Put(':username/reset')
  @SetMetadata('isAdmin', true)
  async resetPassword(@Param('username') username: string) {
    try {
      const resetPassword: ResetPassword = {
        is_used: false,
        reset_link: randomUUID(),
        created_at: new Date().toISOString(),
      };
      await this.mongoService.update(
        CollectionName.BetaUsers,
        { username },
        { resetPassword }
      );
      return resetPassword;
    } catch (error) {
      throw new HttpException(
        `Ooops, you're not supposed to see this: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
