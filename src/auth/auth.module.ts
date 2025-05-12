import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';
import { TrainerSignUpStrategy } from './strategies/trainer-signup.strategy';
import { UserSignUpStrategy } from './strategies/user-signup.strategy';
import { TrainerModule } from 'src/trainer/trainer.module';
import { RedisModule } from 'src/redis.module';
import { OtpModule } from './services/otp/otp.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthService } from './auth.service';
import { JwtTokenService } from './services/jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    TrainerModule,
    RedisModule,
    OtpModule,
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignUpStrategyResolver,
    TrainerSignUpStrategy,
    UserSignUpStrategy,
    AuthService,
    JwtTokenService,
  ],
})
export class AuthModule {}
