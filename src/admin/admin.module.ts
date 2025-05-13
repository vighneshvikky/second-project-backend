import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtTokenService } from 'src/auth/services/jwt/jwt.service';
import { RedisModule } from 'src/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { TrainerModule } from '../trainer/trainer.module';

@Module({
  imports: [
    RedisModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    TrainerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtTokenService],
})
export class AdminModule {} 