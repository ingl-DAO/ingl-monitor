import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserService } from '../services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (user && bcrypt.compareSync(password, user.password)) {
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
