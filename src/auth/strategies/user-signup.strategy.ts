import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ISignUpStrategy } from '../interfaces/signup.strategy.interface';
import { UserRepository } from 'src/user/user.repository';
import { CreateAccountDto } from '../dto/createAccount.dto';
import { PasswordUtil } from '../../common/helpers/password.util';
import Redis from 'ioredis';

@Injectable()
export class UserSignUpStrategy implements ISignUpStrategy {
  constructor(private readonly userRepo: UserRepository, @Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async signUp(data: CreateAccountDto) {
    const existing = await this.userRepo.findByEmail(data.email);
    
    if(existing){
      throw new ConflictException('User already exists');
    }

    const hashPassword = await PasswordUtil.hashPassword(data.password);

    const userToStore = {
      ...data,
      password: hashPassword
    }

    await  this.redis.set(`temp_user:${data.email}`, JSON.stringify(userToStore), 'EX', 300);

    // return this.userRepo.create(userToCreate);
  
  }


}
