import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PasswordUtil } from 'src/common/helpers/password.util';
import Redis from 'ioredis';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { IUserRepository } from 'src/user/interfaces/user-repository.interface';
import { ITrainerRepository } from 'src/trainer/interfaces/trainer-repository.interface';
import { IJwtTokenService } from './interfaces/ijwt-token-service.interface';
import { BaseModel } from 'src/common/model/base-model';
import {
  IUserService,
  USER_SERVICE,
} from 'src/user/interfaces/user-service.interface';
import {
  ITrainerService,
  TRAINER_SERVICE,
} from 'src/trainer/interfaces/trainer-service.interface';
import {
  IMailService,
  MAIL_SERVICE,
} from 'src/common/helpers/mailer/mail-service.interface';
import { IAuthService } from './interfaces/auth-service.interface';
import { AUTH_SERVICE_REGISTRY } from './interfaces/auth-service-registry.interface';
import { UserRoleServiceRegistry } from 'src/common/services/user-role-service.registry';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_SERVICE) private userService: IUserService,
    @Inject(TRAINER_SERVICE) private trainerService: ITrainerService,
    @Inject(IJwtTokenService) private readonly jwtService: IJwtTokenService,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
    @Inject(IUserRepository) private readonly userRepo: IUserRepository,
    @Inject(AUTH_SERVICE_REGISTRY)
    private readonly roleServiceRegistry: UserRoleServiceRegistry,
    @Inject(ITrainerRepository)
    private readonly trainerRepo: ITrainerRepository,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async verifyLogin(body: LoginDto) {
    const refreshTokenTTL = 7 * 24 * 60 * 60;

    const userService = this.roleServiceRegistry.getServiceByRole(body.role);
    const user = await userService.findByEmail(body.email);

    if (
      !user ||
      typeof user.password !== 'string' ||
      typeof user._id === 'undefined'
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await PasswordUtil.comparePassword(
      body.password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userId = user.id.toString();
    const accessToken = this.jwtService.signAccessToken({
      sub: userId,
      role: user.role,
      isBlocked: false,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: userId,
      role: user.role,
      isBlocked: false,
    });
    await this.redis.set(
      refreshToken,
      user.id.toString(),
      'EX',
      refreshTokenTTL,
    );

    return { accessToken, refreshToken, user };
  }

  async initiatePasswordReset(email: string, role: string) {

    const userService = this.roleServiceRegistry.getServiceByRole(role);
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.jwtService.signPasswordResetToken({
      sub: user.id,
      role: user.role,
      isBlocked: false,
    });

    const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}&role=${role}`;

    await this.mailService.sendResetLink(user.email, resetUrl);

    return {
      message: 'Password reset link sent to your email',
      data: null,
    };
  }

  async resetPassword(token: string, role: string, password: string) {
 
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const payload = this.jwtService.verifyPasswordResetToken(token);

    const userId = payload.sub;

    const hashedPassword = await PasswordUtil.hashPassword(password);

    
    const userService = this.roleServiceRegistry.getServiceByRole(role);
     await userService.updatePassword(userId, hashedPassword);


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
      isBlocked: false,
    });

    const newRefreshToken = this.jwtService.signRefreshToken({
      sub: userId,
      role,
      isBlocked: false,
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
      isBlocked: false,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: user._id,
      role: user.role,
      isBlocked: false,
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
  ): Promise<{ accessToken: string; refreshToken: string; user: BaseModel }> {
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
      isBlocked: false,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: user._id,
      role: user.role,
      isBlocked: false,
    });
    await this.redis.set(
      refreshToken,
      user._id.toString(),
      'EX',
      refreshTokenTTL,
    );
    return { accessToken, refreshToken, user };
  }

  async getUser(id: string) {
    return this.trainerRepo.findById(id);
  }
}
