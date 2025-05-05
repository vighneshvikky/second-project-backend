import { ConflictException, Injectable } from '@nestjs/common';
import { ISignUpStrategy } from '../interfaces/signup.strategy.interface';
import { TrainerRepository } from 'src/trainer/trainer.repository';
import { CreateAccountDto } from '../dto/createAccount.dto';
import { PasswordUtil } from 'src/common/helpers/password.util';

@Injectable()
export class TrainerSignUpStrategy implements ISignUpStrategy {
  constructor(private readonly trainerRepo: TrainerRepository) {}

  async signUp(data: CreateAccountDto) {
    const existing = await this.trainerRepo.findByEmail(data.email);

        if(existing){
          throw new ConflictException('User already exists');
        }

            const hashPassword = await PasswordUtil.hashPassword(data.password);
        
            const trainerToCreate = {
              ...data,
              password: hashPassword
            }
    return this.trainerRepo.create(trainerToCreate);
  }
}
