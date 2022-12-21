import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CollectionName, User } from 'src/Mongo/mongo.dto';
import { MongoService } from 'src/Mongo/mongo.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private mongoService: MongoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { username: string; iat: number; exp: number }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.mongoService.findOne<User>(
      CollectionName.BetaUsers,
      {
        username: payload.username,
      }
    );
    return user;
  }
}
