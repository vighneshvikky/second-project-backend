import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { TrainerService } from 'src/trainer/trainer.service';
import { PasswordUtil } from 'src/common/helpers/password.util';
import { JwtTokenService } from './services/jwt/jwt.service';
import Redis from 'ioredis';
import { MailService } from 'src/common/helpers/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private trainerService: TrainerService,
    private jwtService: JwtTokenService,
    private mailService: MailService,

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
   
    if(!user){
      throw new UnauthorizedException('User not found')
    }
  

  

    if ( !await PasswordUtil.comparePassword(body.password , user.password)) {
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
    await this.redis.set(
      refreshToken,
      user._id.toString(),
      'EX',
      refreshTokenTTL,
    );

    return { accessToken, user };
  }

  async initiatePasswordReset(email: string, role: string) {
    const user =
      role === 'trainer'
        ? await this.trainerService.findByEmail(email)
        : await this.userService.findByEmail(email);

        if(!user){
          throw new NotFoundException('User not found');
        }

        const token = this.jwtService.signPasswordResetToken({sub: user.id, role: user.role});

        const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}&role=${role}`

        await this.mailService.sendResetLink(user.email, resetUrl)

        return {
          message: 'Password reset link sent to your email',
          data: null,
        };
  }

async resetPassword(token: string, role: string, password: string){

console.log('rold befor sem', role)
  if (!password) {
    throw new BadRequestException('Password is required');
  }
  
  const payload = this.jwtService.verifyPasswordResetToken(token);

  const userId = payload.sub;

  const hashedPassword = await PasswordUtil.hashPassword(password)
   console.log('hashe', hashedPassword)
  if(role === 'trainer'){
    await this.trainerService.updatePassword(userId, hashedPassword)
  }else{
    await this.userService.updatePassword(userId, hashedPassword)
  }
  return {
    message: 'Password has been reset successfully',
    data: {role}
  }
}
  
}
