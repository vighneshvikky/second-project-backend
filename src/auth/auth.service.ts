import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { TrainerService } from 'src/trainer/trainer.service';
import { PasswordUtil } from 'src/common/helpers/password.util';
import { JwtTokenService } from './services/jwt/jwt.service';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private trainerService: TrainerService,
    private jwtService: JwtTokenService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  async verifyLogin(body: LoginDto) {
    let user;
    const refreshTokenTTL = 7 * 24 * 60 * 60;
    if (body.role === 'trainer') {
      user = await this.trainerService.findByEmail(body.email);
    } else {
      user = await this.userService.findByEmail(body.email);
    }

    if (!user || !PasswordUtil.comparePassword(body.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const accessToken = this.jwtService.signAccessToken({
      sub: user._id,
      role: user.role,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: user._id,
      role: user.role,
    });
  // console.log('accessToken', accessToken);
  // console.log('refreshToken', refreshToken);
    await this.redis.set(refreshToken, user._id.toString(), 'EX', refreshTokenTTL);

    return { accessToken , user};
  }
}
