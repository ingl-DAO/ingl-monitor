import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CollectionName, User, UserAuthDto } from 'src/Mongo/mongo.dto';
import { MongoService } from '../Mongo/mongo.service';

@Injectable()
export class AuthService {
  constructor(
    private mongoService: MongoService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.mongoService.findOne<User>(
      CollectionName.BetaUsers,
      {
        email,
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
    const payload = { email: user.email };
    return this.jwtService.sign(payload);
  }

  async signUp({ email, password, reset_id }: UserAuthDto) {
    const user = await this.mongoService.findOne<User>(
      CollectionName.BetaUsers,
      {
        email,
      }
    );
    if (user && user.resetPassword?.reset_id === reset_id) {
      await this.mongoService.update(
        CollectionName.BetaUsers,
        { email },
        { password: bcrypt.hashSync(password, Number(process.env.SALT)) }
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userInfo } = user
      return {
        ...userInfo,
        access_token: this.login(user),
      };
    }
    throw new UnauthorizedException();
  }
}
