import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ResendOtpDto } from 'src/auth/dto/resend-otp.dto';
import { VerifyOtpDto } from 'src/auth/dto/verify-otp.dto';
import { ApiResponse } from 'src/auth/interfaces/api.response.interface';
import { MailService } from 'src/common/helpers/mailer/mailer.service';
import { TrainerRepository } from 'src/trainer/repositories/trainer.repository';
import { UserRepository } from 'src/user/repositories/user.repository';

@Injectable()
export class OtpService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly mailService: MailService,
    private readonly userRepo: UserRepository,
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.set(`otp:${email}`, otp, 'EX', 300);
    await this.mailService.sendOtp(email, otp);

    return otp;
  }

  async verifyOtp(
    data: VerifyOtpDto,
  ): Promise<{
    message: string;
    data: { message: string; isBlocked: boolean; role: string };
  }> {
    const storedOtp = await this.redis.get(`otp:${data.email}`);

    if (!storedOtp) {
      throw new NotFoundException('OTP expired or not found');
    }

    if (storedOtp !== data.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const userKey =
      data.role === 'trainer'
        ? `temp_trainer:${data.email}`
        : `temp_user:${data.email}`;
    const tempData = await this.redis.get(userKey);

    if (!tempData) {
      throw new NotFoundException('User data not found');
    }

    const parsedData = JSON.parse(tempData);

    if (data.role === 'user') {
      await this.userRepo.create(parsedData);
    } else if (data.role === 'trainer') {
      await this.trainerRepo.create(parsedData);
    }

    await this.redis.del(`otp:${data.email}`);
    await this.redis.del(userKey);
    console.log(data.role);

    return {
      message: 'Account Created Successfully',
      data: {
        message: 'Account Created Successfully',
        isBlocked: false,
        role: data.role,
      },
    };
  }

  async resendOtp(
    data: ResendOtpDto,
  ): Promise<ApiResponse<{ email: string; role: string }>> {
    

        const userKey =
      data.role === 'trainer'
        ? `temp_trainer:${data.email}`
        : `temp_user:${data.email}`;
    const tempData = await this.redis.get(userKey);
    if (!tempData) {
      throw new NotFoundException('User data not found ');
    }

    await this.generateOtp(data.email);

    // await this.redis.set(`otp:${data.email}`, newOtp, 'EX', 300);

    return {
      message: 'OTP resent successfully',
      data: {
        email: data.email,
        role: data.role,
      },
    };
  }
}
