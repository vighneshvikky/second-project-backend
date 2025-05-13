import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PasswordUtil } from 'src/common/helpers/password.util';
import { JwtTokenService } from 'src/auth/services/jwt/jwt.service';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { TrainerRepository } from '../trainer/trainer.repository';
import { PaginatedResult } from '../common/repositories/base.repository';

interface GetUsersOptions {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminService {
  private readonly adminEmail = 'vadmin@gmail.com';
  private readonly adminPassword = 'Vor@1234';

  constructor(
    private jwtService: JwtTokenService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly userRepository: UserRepository,
    private readonly trainerRepository: TrainerRepository,
  ) {}

  async verifyAdminLogin(email: string, password: string) {
    if (email !== this.adminEmail) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!PasswordUtil.comparePassword(password, await PasswordUtil.hashPassword(this.adminPassword))) {
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

    // Store refresh token in Redis with 7 days expiry
    const refreshTokenTTL = 7 * 24 * 60 * 60;
    await this.redis.set(
      refreshToken,
      'admin',
      'EX',
      refreshTokenTTL,
    );

    return { accessToken, refreshToken };
  }

  async getUsers({ search, role, page = 1, limit = 10 }: GetUsersOptions): Promise<PaginatedResult<any>> {
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    if (role === 'user') {
      return this.userRepository.findPaginated(searchQuery, { page, limit });
    } else if (role === 'trainer') {
      return this.trainerRepository.findPaginated(searchQuery, { page, limit });
    } else {
      const [userResult, trainerResult] = await Promise.all([
        this.userRepository.findPaginated(searchQuery, { page, limit }),
        this.trainerRepository.findPaginated(searchQuery, { page, limit })
      ]);

      return {
        data: [...userResult.data, ...trainerResult.data],
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
      const updatedTrainer = await this.trainerRepository.updateById(id, { isBlocked: !trainer.isBlocked });
      return {
        message: `Trainer ${updatedTrainer.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        isBlocked: updatedTrainer.isBlocked
      };
    }
    throw new NotFoundException('Invalid role specified');
  }
} 