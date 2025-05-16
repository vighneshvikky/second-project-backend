import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(readonly userRepo: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepo.updatePassword(userId, newPassword);
  }

 async createFromGoogle(payload: {
  email: string | undefined;
  name: string | undefined;
  picture?: string;
}): Promise<User> {
  if (!payload.email || !payload.name) {
    throw new BadRequestException('Email and name are required');
  }

  return this.userRepo.createFromGoogle({
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });
}
}
