import { User } from '../schemas/user.schema';
import { UpdateUserDto } from '../dtos/user.dto';
import { Trainer } from 'src/trainer/schemas/trainer.schema';
import { IUserRoleService } from 'src/common/interface/user-role-service.interface';

export const USER_SERVICE = 'USER_SERVICE';

export interface FindApprovedTrainerQuery {
  category?: string;
  name?: string | { $regex: string; $options: string };
}

export interface IUserService extends IUserRoleService {
  findByIdAndUpdate(
    userId: string,
    data: Partial<UpdateUserDto>,
  ): Promise<User>;
  findTrainer(id: string): Promise<Trainer | null>;
  findApprovedTrainer(filters: FindApprovedTrainerQuery): Promise<Trainer[]>;
}
