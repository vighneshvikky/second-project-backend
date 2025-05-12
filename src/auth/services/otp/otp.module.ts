import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailModule } from 'src/common/helpers/mailer/mailer.module';
import { RedisModule } from 'src/redis.module';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { TrainerModule } from 'src/trainer/trainer.module';

@Module({
  imports: [MailModule, RedisModule, UserModule, TrainerModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
