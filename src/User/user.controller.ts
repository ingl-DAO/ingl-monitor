import { Controller, Get, Post, SetMetadata, UseGuards } from '@nestjs/common';
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
  async addNewUser(newUser: UserPostDto) {
    return this.mongoService.insert(CollectionName.BetaUsers, { ...newUser });
  }
}
