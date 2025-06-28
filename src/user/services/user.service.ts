import { Inject, Injectable } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { UpdateUserDto } from '../dtos/user.dto';
import { ITrainerRepository } from 'src/trainer/interfaces/trainer-repository.interface';
import { Trainer } from 'src/trainer/schemas/trainer.schema';

type FindApprovedTrainerQuery = Record<string, unknown> & {
  role: string;
  verificationStatus: string;
  isBlocked: boolean;
  category?: string;
  name?: unknown; 
};


@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
    @Inject(ITrainerRepository)
    private readonly trainerRepo: ITrainerRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.userRepo.updatePassword(userId, newPassword);
  }

  async findByIdAndUpdate(
    userId: string,
    data: Partial<UpdateUserDto>,
  ): Promise<User> {
    return await this.userRepo.updateById(userId, {
      ...data,
      isVerified: true,
      image: data.image
    });
  }

  async findTrainer(id: string): Promise<Trainer | null> {
    return await this.trainerRepo.findById(id);
  }

  async findApprovedTrainer(filters: {
    category?: string;
    name?: string;
  }): Promise<Trainer[]> {
    const query: FindApprovedTrainerQuery = {
      role: 'trainer',
      verificationStatus: 'approved',
      isBlocked: false,
    };
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }

    return await this.trainerRepo.findAll(query);
  }
}
