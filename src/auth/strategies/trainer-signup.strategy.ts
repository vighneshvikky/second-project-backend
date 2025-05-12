import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ISignUpStrategy } from '../interfaces/signup.strategy.interface';
import { TrainerRepository } from 'src/trainer/trainer.repository';
import { CreateAccountDto } from '../dto/createAccount.dto';
import { PasswordUtil } from 'src/common/helpers/password.util';
import Redis from 'ioredis';
import { OtpService } from '../services/otp/otp.service';

@Injectable()
export class TrainerSignUpStrategy implements ISignUpStrategy {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private readonly otpService: OtpService,
  ) {}

  async signUp(data: CreateAccountDto) {
    const existing = await this.trainerRepo.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await PasswordUtil.hashPassword(data.password);

    const trainerToCreate = {
      ...data,
      password: hashPassword,
    };

    await this.redis.set(
      `temp_trainer:${data.email}`,
      JSON.stringify(trainerToCreate),
      'EX',
      300,
    );

    const otp = await this.otpService.generateOtp(data.email);

    return {
       message: 'OTP sent to your email ',
      data: {
        email: data.email,
        role: data.role,
      },
    };
  }
}
