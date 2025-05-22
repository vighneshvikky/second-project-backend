import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { TrainerService } from 'src/trainer/trainer.service';
import { PasswordUtil } from 'src/common/helpers/password.util';
import { JwtTokenService } from './services/jwt/jwt.service';
import Redis from 'ioredis';
import { MailService } from 'src/common/helpers/mailer/mailer.service';
import { UserRepository } from 'src/user/user.repository';
import { TrainerRepository } from 'src/trainer/trainer.repository';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private trainerService: TrainerService,
    private jwtService: JwtTokenService,
    private mailService: MailService,
    private userRepo: UserRepository,
    private trainerRepo: TrainerRepository,

    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async verifyLogin(body: LoginDto) {
    let user;
    const refreshTokenTTL = 7 * 24 * 60 * 60;
    console.log('body.role', body.role);
    if (body.role === 'trainer') {
      user = await this.trainerService.findByEmail(body.email);
    } else {
      user = await this.userService.findByEmail(body.email);
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!(await PasswordUtil.comparePassword(body.password, user.password))) {
      console.log('validation successfully');
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

    return { accessToken, refreshToken, user };
  }

  async initiatePasswordReset(email: string, role: string) {
    const user =
      role === 'trainer'
        ? await this.trainerService.findByEmail(email)
        : await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.jwtService.signPasswordResetToken({
      sub: user.id,
      role: user.role,
    });

    const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}&role=${role}`;

    await this.mailService.sendResetLink(user.email, resetUrl);

    return {
      message: 'Password reset link sent to your email',
      data: null,
    };
  }

  async resetPassword(token: string, role: string, password: string) {
    console.log('rold befor sem', role);
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const payload = this.jwtService.verifyPasswordResetToken(token);

    const userId = payload.sub;

    const hashedPassword = await PasswordUtil.hashPassword(password);
    console.log('hashe', hashedPassword);
    if (role === 'trainer') {
      await this.trainerService.updatePassword(userId, hashedPassword);
    } else {
      await this.userService.updatePassword(userId, hashedPassword);
    }
    return {
      message: 'Password has been reset successfully',
      data: { role },
    };
  }

  async rotateRefreshToken(
    oldToken: string,
    role: 'user' | 'trainer' | 'admin',
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const userId = await this.redis.get(oldToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.redis.del(oldToken);

    const accessToken = this.jwtService.signAccessToken({
      sub: userId,
      role: role,
    });

    const newRefreshToken = this.jwtService.signRefreshToken({
      sub: userId,
      role,
    });

    await this.redis.set(newRefreshToken, userId, 'EX', 7 * 24 * 60 * 60);

    return { accessToken, newRefreshToken };
  }

  async loginOrRegisterGoogleUser(
    googleUser: { email: string; name: string; googleId: string },
    role: 'user' | 'trainer',
  ) {
    let user;
    const refreshTokenTTL = 7 * 24 * 60 * 60;
    if (role === 'trainer') {
      user = await this.trainerService.findByEmail(googleUser.email);

      if (!user) {
        user = await this.trainerRepo.create({
          name: googleUser.name,
          email: googleUser.email,
          role: 'trainer',
          isVerified: false,
          isBlocked: false,
          googleId: googleUser.googleId,
          provider: 'google',
        });
      }
    } else if (role === 'user') {
      user = await this.userService.findByEmail(googleUser.email);
      if (!user) {
        user = await this.userRepo.create({
          name: googleUser.name,
          email: googleUser.email,
          role: 'user',
          isVerified: false,
          isBlocked: false,
          googleId: googleUser.googleId,
          provider: 'google',
        });
      }
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

    return { accessToken, refreshToken, user };
  }

  async googleLogin(
    code: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const id_token = tokenRes.data.id_token;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) throw new Error('Invalid Google token payload');

    const { email, name, picture, sub: googleId } = payload;

    if (!email || !name || !picture || !googleId) {
      throw new Error('No Data fount form payload');
    }

    if (role !== 'trainer' && role !== 'user') throw new Error('Invalid role');
    let user;
    const refreshTokenTTL = 7 * 24 * 60 * 60;
    if (role === 'trainer') {
      user = await this.trainerService.findByEmail(email);

      if (!user) {
        user = await this.trainerRepo.create({
          name: name,
          email: email,
          role: 'trainer',
          isVerified: false,
          isBlocked: false,
          googleId: googleId,
          provider: 'google',
          image: picture,
        });
      }
    } else if (role === 'user') {
      user = await this.userService.findByEmail(email);
      if (!user) {
        user = await this.userRepo.create({
          name: name,
          email: email,
          role: 'user',
          isVerified: false,
          isBlocked: false,
          googleId: googleId,
          provider: 'google',
          image: picture,
        });
      }
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
    console.log('user from google user ===>    ', user);
    return { accessToken, refreshToken, user };
  }
}
