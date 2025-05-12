import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(readonly userRepo: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }
}
