import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { SignUpStrategyResolver } from './strategies/signup-strategy.resolver';
import { TrainerSignUpStrategy } from './strategies/trainer-signup.strategy';
import { UserSignUpStrategy } from './strategies/user-signup.strategy';
import { TrainerModule } from 'src/trainer/trainer.module';
import { RedisModule } from 'src/redis.module';


@Module({
  imports: [UserModule, TrainerModule, RedisModule],
  controllers: [AuthController],
  providers: [
    SignUpStrategyResolver,
    TrainerSignUpStrategy,
    UserSignUpStrategy,
  ],
})
export class AuthModule {}
