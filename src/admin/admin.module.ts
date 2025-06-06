import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { JwtTokenService } from 'src/auth/services/jwt/jwt.service';
import { RedisModule } from 'src/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { TrainerModule } from '../trainer/trainer.module';
import { IAdminService } from './interfaces/IAdminService';
import { IUserRepository } from 'src/user/interfaces/user-repository.interface';
import { UserRepository } from 'src/user/repositories/user.repository';
import { ITrainerRepository } from 'src/trainer/interfaces/trainer-repository.interface';
import { TrainerRepository } from 'src/trainer/repositories/trainer.repository';
import { IJwtTokenService } from 'src/auth/interfaces/ijwt-token-service.interface';

@Module({
  imports: [
    RedisModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    TrainerModule,
  ],
  controllers: [AdminController],
  providers: [
    { provide: IAdminService, useClass: AdminService },
    { provide: IJwtTokenService, useClass: JwtTokenService },
  ],
})
export class AdminModule {}
