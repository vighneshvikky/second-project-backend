import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../schemas/user.schema';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepo.updatePassword(userId, newPassword);
  }
}
