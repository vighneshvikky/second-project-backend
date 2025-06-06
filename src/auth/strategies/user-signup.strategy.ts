import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ISignUpStrategy } from '../interfaces/signup.strategy.interface';
import { UserRepository } from 'src/user/repositories/user.repository';
import { CreateAccountDto } from '../dto/createAccount.dto';
import { PasswordUtil } from '../../common/helpers/password.util';
import Redis from 'ioredis';
import { OtpService } from '../services/otp/otp.service';
import { IUserRepository } from 'src/user/interfaces/user-repository.interface';

@Injectable()
export class UserSignUpStrategy implements ISignUpStrategy {
  constructor(
    @Inject(IUserRepository) private readonly userRepo: IUserRepository,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly otpService: OtpService,
  ) {}

  async signUp(data: CreateAccountDto) {
    const existing = await this.userRepo.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await PasswordUtil.hashPassword(data.password);

    const userToStore = {
      ...data,
      password: hashPassword,
    };

    await this.redis.set(
      `temp_user:${data.email}`,
      JSON.stringify(userToStore),
      'EX',
      300,
    );

      await this.otpService.generateOtp(data.email);

    return {
      message: 'OTP sent to your email ',
      data: {
        email: data.email,
        role: data.role,
      },
    };
  }
}
