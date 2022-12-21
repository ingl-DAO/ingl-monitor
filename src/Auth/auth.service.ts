import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CollectionName, User } from 'src/Mongo/mongo.dto';
import { MongoService } from '../Mongo/mongo.service';

@Injectable()
export class AuthService {
  constructor(
    private mongoService: MongoService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.mongoService.findOne<User>(
      CollectionName.BetaUsers,
      {
        username,
      }
    );
    if (user && bcrypt.compareSync(password, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userInfo } = user;
      return userInfo;
    }
    return null;
  }

  login(user: User) {
    const payload = { username: user.username };
    return this.jwtService.sign(payload);
  }
}
