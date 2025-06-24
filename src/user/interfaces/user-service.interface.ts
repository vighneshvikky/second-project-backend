import { User } from '../schemas/user.schema';
import { UpdateUserDto } from '../dtos/user.dto';
import { Trainer } from 'src/trainer/schemas/trainer.schema';

export const  USER_SERVICE = 'USER_SERVICE';

export interface FindApprovedTrainerQuery {
  category?: string;
  name?: string | { $regex: string; $options: string };
}

export interface IUserService {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  findByIdAndUpdate(userId: string, data: Partial<UpdateUserDto>): Promise<User>;
  findTrainer(id: string): Promise<Trainer | null>;
  findApprovedTrainer(filters: FindApprovedTrainerQuery): Promise<Trainer[]>;
}
