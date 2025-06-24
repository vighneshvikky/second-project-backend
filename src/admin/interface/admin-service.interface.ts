import { User } from 'src/user/schemas/user.schema';
import { Trainer } from 'src/trainer/schemas/trainer.schema';
import { PaginatedResult } from 'src/common/interface/base-repository.interface';

export const ADMIN_SERVICE = 'ADMIN_SERVICE'

export interface GetUsersOptions {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
}

export interface IAdminService {
  verifyAdminLogin(email: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  getUsers<T extends User | Trainer>(
    options: GetUsersOptions,
  ): Promise<PaginatedResult<T>>;

  toggleBlockStatus(
    id: string,
    role: 'user' | 'trainer',
  ): Promise<User | Trainer>;

  getUnverifiedTrainers(
    options: GetUsersOptions,
  ): Promise<PaginatedResult<Trainer>>;

  approveTrainer(trainerId: string): Promise<Trainer>;

  rejectTrainer(trainerId: string, reason: string): Promise<Trainer>;
}
