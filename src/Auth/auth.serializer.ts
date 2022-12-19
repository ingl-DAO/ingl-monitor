import { PassportSerializer } from '@nestjs/passport';
import { User, UserService } from 'src/services/user.service';

export class AuthSerializer extends PassportSerializer {
  constructor(private userService: UserService) {
    super();
  }
  serializeUser(user: User, done: (err, username: string) => void) {
    done(null, user.username);
  }
  async deserializeUser(username: string, done: (err, user: User) => void) {
    const user = await this.userService.findOne(username);
    done(null, user as User);
  }
}
