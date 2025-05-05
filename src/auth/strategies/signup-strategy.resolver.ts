
import { Injectable } from '@nestjs/common';
import { UserSignUpStrategy } from './user-signup.strategy';
import { TrainerSignUpStrategy } from './trainer-signup.strategy';
import { ISignUpStrategy } from '../interfaces/signup.strategy.interface';

@Injectable()
export class SignUpStrategyResolver {
  constructor(
    private readonly userStrategy: UserSignUpStrategy,
    private readonly trainerStrategy: TrainerSignUpStrategy,
  ) {}

  resolve(role: string): ISignUpStrategy {
    switch (role) {
      case 'user':
        return this.userStrategy;
      case 'trainer':
        return this.trainerStrategy;
      default:
        throw new Error('Invalid role');
    }
  }
}
