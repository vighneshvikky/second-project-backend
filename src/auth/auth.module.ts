import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';
import { TrainerSignUpStrategy } from './strategies/trainer-signup.strategy';
import { UserSignUpStrategy } from './strategies/user-signup.strategy';
import { TrainerModule } from 'src/trainer/trainer.module';
import { RedisModule } from 'src/redis.module';
import { OtpModule } from './services/otp/otp.module';
import { AuthService } from './auth.service';
import { JwtTokenService } from './services/jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/common/helpers/mailer/mailer.module';
import { IJwtTokenService } from './interfaces/ijwt-token-service.interface';
import { OTP_SERVICE } from './interfaces/otp-service.interface';
import { OtpService } from './services/otp/otp.service';
import { MAIL_SERVICE } from 'src/common/helpers/mailer/mail-service.interface';
import { MailService } from 'src/common/helpers/mailer/mailer.service';
import { AUTH_SERVICE } from './interfaces/auth-service.interface';
import { UserRoleServiceRegistry } from 'src/common/services/user-role-service.registry';
import { AUTH_SERVICE_REGISTRY } from './interfaces/auth-service-registry.interface';

@Module({
  imports: [
    UserModule,
    TrainerModule,
    RedisModule,
    OtpModule,
    MailModule,
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
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: IJwtTokenService,
      useClass: JwtTokenService,
    },
    {
      provide: OTP_SERVICE,
      useClass: OtpService,
    },
    {
      provide: MAIL_SERVICE,
      useClass: MailService,
    },
    {
      provide: AUTH_SERVICE_REGISTRY,
      useClass:UserRoleServiceRegistry,
    },
  ],
  exports: [IJwtTokenService],
})
export class AuthModule {}
