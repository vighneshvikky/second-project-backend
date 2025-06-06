import {  Inject, Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UpdateUserDto } from '../dtos/user.dto';

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

async findByIdAndUpdate(userId: string, data: Partial<UpdateUserDto>): Promise<User> {
  return await this.userRepo.updateById(userId, data);
}

}
