import {
  Body,
  Controller,
  Get,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from 'src/Auth/jwt/jwt-auth.guard';
import { CollectionName, User, UserPostDto } from 'src/Mongo/mongo.dto';
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
    return this.mongoService.insert(CollectionName.BetaUsers, { ...newUser });
  }
}
