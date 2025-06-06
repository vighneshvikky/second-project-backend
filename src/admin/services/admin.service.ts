import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PasswordUtil } from 'src/common/helpers/password.util';
import { JwtTokenService } from 'src/auth/services/jwt/jwt.service';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { TrainerRepository } from '../../trainer/repositories/trainer.repository';
import { User } from 'src/user/schemas/user.schema';
import { Trainer } from 'src/trainer/schemas/trainer.schema';
import { PaginatedResult } from 'src/common/interface/base-repository.interface';
import { IUserRepository } from 'src/user/interfaces/user-repository.interface';
import { ITrainerRepository } from 'src/trainer/interfaces/trainer-repository.interface';
import { IJwtTokenService } from 'src/auth/interfaces/ijwt-token-service.interface';


interface GetUsersOptions {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminService {
  private readonly adminEmail = process.env.ADMIN_EMAIL!;
  private readonly adminPassword = process.env.ADMIN_PASSWORD!;

  constructor(
    @Inject(IJwtTokenService) private readonly jwtService: IJwtTokenService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(ITrainerRepository) private readonly trainerRepository: ITrainerRepository
  ) {}

  async verifyAdminLogin(email: string, password: string) {

    if (email !== this.adminEmail) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!await PasswordUtil.comparePassword(password, this.adminPassword)) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: 'admin',
      role: 'admin',
    });

    const refreshToken = this.jwtService.signRefreshToken({
      sub: 'admin',
      role: 'admin',
    });

    
    const refreshTokenTTL = 7 * 24 * 60 * 60 * 1000;
    await this.redis.set(
      refreshToken,
      'admin',
      'EX',
      refreshTokenTTL,
    );

    return { accessToken, refreshToken };
  }

  async getUsers<T extends User | Trainer>({ search, role, page = 1, limit = 10 }: GetUsersOptions): Promise<PaginatedResult<T>> {
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    if (role === 'user') {
      return this.userRepository.findPaginated(searchQuery, { page, limit }) as Promise<PaginatedResult<T>>;
    } else if (role === 'trainer') {
      return this.trainerRepository.findPaginated(searchQuery, { page, limit }) as Promise<PaginatedResult<T>>;
    } else {
      const [userResult, trainerResult] = await Promise.all([
        this.userRepository.findPaginated(searchQuery, { page, limit }),
        this.trainerRepository.findPaginated(searchQuery, { page, limit })
      ]);

      return {
        data: [...userResult.data, ...trainerResult.data] as T[],
        total: userResult.total + trainerResult.total,
        page,
        limit,
        totalPages: Math.ceil((userResult.total + trainerResult.total) / limit)
      };
    }
  }

  async toggleBlockStatus(id: string, role: 'user' | 'trainer'): Promise<{ message: string; isBlocked: boolean }> {
  
    if (role === 'user') {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updatedUser = await this.userRepository.updateById(id, { isBlocked: !user.isBlocked });
      return {
        message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        isBlocked: updatedUser.isBlocked
      };
    } else if (role === 'trainer') {

      const trainer = await this.trainerRepository.findById(id);
      if (!trainer) {
        throw new NotFoundException('Trainer not found');
      }
    const updatedTrainer =  await this.trainerRepository.updateById(id, { isBlocked: !trainer.isBlocked });
        return {
        message: `User ${updatedTrainer.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        isBlocked: updatedTrainer.isBlocked
      };
    }
    throw new NotFoundException('Invalid role specified');
  }

  async getUnverifiedTrainers({ page = 1, limit = 10 }: GetUsersOptions): Promise<PaginatedResult<Trainer>> {
    const query = { isVerified: false };
    return this.trainerRepository.findPaginated(query, { page, limit });
  }

  async approveTrainer(trainerId: string): Promise<Trainer> {
    return this.trainerRepository.updateById(trainerId, {
      isVerified: true,
      verificationStatus: 'approved',
      verifiedAt: new Date(),
    });
  }


  async rejectTrainer(trainerId: string, reason: string): Promise<Trainer> {
    return this.trainerRepository.updateById(trainerId, {
      isVerified: false,
      verificationStatus: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date(),
    });
  }



  
private getRepoByRole(role: 'user' | 'trainer'): IUserRepository | ITrainerRepository {
  if (role === 'user') return this.userRepository;
  if (role === 'trainer') return this.trainerRepository;
  throw new NotFoundException('Invalid role specified');
}
  
  
  
} 