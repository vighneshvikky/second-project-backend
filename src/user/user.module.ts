import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { IUserRepository } from './interfaces/user-repository.interface';
import { IJwtTokenService } from 'src/auth/interfaces/ijwt-token-service.interface';
import { JwtTokenService } from 'src/auth/services/jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';

import { TrainerModule } from 'src/trainer/trainer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
     JwtModule.register({}),
     TrainerModule
  ],
  controllers: [UserController],
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IJwtTokenService,
      useClass: JwtTokenService,
    },
    UserRepository,
    UserService,
  ],
  exports: [
    { provide: IUserRepository, useClass: UserRepository },
    UserService,
  ],
})
export class UserModule {}
