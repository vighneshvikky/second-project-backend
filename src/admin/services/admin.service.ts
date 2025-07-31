import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PasswordUtil } from 'src/common/helpers/password.util';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { User } from 'src/user/schemas/user.schema';
import { Trainer } from 'src/trainer/schemas/trainer.schema';
import { PaginatedResult } from 'src/common/interface/base-repository.interface';
import { IUserRepository } from 'src/user/interfaces/user-repository.interface';
import { ITrainerRepository } from 'src/trainer/interfaces/trainer-repository.interface';
import { IJwtTokenService } from 'src/auth/interfaces/ijwt-token-service.interface';
import { GetUsersOptions, IAdminService } from '../interface/admin-service.interface';
import { IMailService, MAIL_SERVICE } from 'src/common/helpers/mailer/mail-service.interface';
import { MailService } from 'src/common/helpers/mailer/mailer.service';



@Injectable()
export class AdminService implements IAdminService {
  private readonly adminEmail = process.env.ADMIN_EMAIL!;
  private readonly adminPassword = process.env.ADMIN_PASSWORD!;
  private url = `${process.env.FRONTEND_URL}/auth/login?role=trainer`;

  constructor(
    @Inject(IJwtTokenService) private readonly jwtService: IJwtTokenService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
    @Inject(ITrainerRepository)
    private readonly trainerRepository: ITrainerRepository,
  ) {}

  async verifyAdminLogin(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (email !== this.adminEmail) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!(await PasswordUtil.comparePassword(password, this.adminPassword))) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: 'admin',
      role: 'admin',
      isBlocked: false,
    });

    const refreshToken = this.jwtService.signRefreshToken({
      sub: 'admin',
      role: 'admin',
      isBlocked: false,
    });

    const refreshTokenTTL = 7 * 24 * 60 * 60 * 1000;
    await this.redis.set(refreshToken, 'admin', 'EX', refreshTokenTTL);

    return { accessToken, refreshToken };
  }

  async getUsers<T extends User | Trainer>({
    search,
    page = 1,
    limit = 10,
  }: GetUsersOptions): Promise<PaginatedResult<T>> {
    page = Number(page);
    limit = Number(limit);

    if (!limit || limit <= 0) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [allUsers, allTrainers] = await Promise.all([
      this.userRepository.find(searchQuery),
      this.trainerRepository.find(searchQuery),
    ]);

    const combined = [...allUsers, ...allTrainers].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    const total = combined.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = combined.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData as T[],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async toggleBlockStatus(
    id: string,
    role: 'user' | 'trainer',
  ): Promise<User | Trainer> {
    if (role === 'user') {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updatedUser = await this.userRepository.updateById(id, {
        isBlocked: !user.isBlocked,
      });
      return updatedUser;
    } else if (role === 'trainer') {
      const trainer = await this.trainerRepository.findById(id);
      if (!trainer) {
        throw new NotFoundException('Trainer not found');
      }
      const updatedTrainer = await this.trainerRepository.updateById(id, {
        isBlocked: !trainer.isBlocked,
      });
      return updatedTrainer;
    }
    throw new NotFoundException('Invalid role specified');
  }

  async getUnverifiedTrainers({
    page = 1,
    limit = 10,
  }: GetUsersOptions): Promise<PaginatedResult<Trainer>> {
    const query = { isVerified: false, verificationStatus: 'pending' };
    return this.trainerRepository.findPaginated(query, { page, limit });
  }

  async approveTrainer(trainerId: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.updateById(trainerId, {
      isVerified: true,
      verificationStatus: 'approved',
      verifiedAt: new Date(),
    });

    await this.mailService.sendMail(trainer.email, 'accept', this.url);

    return trainer;
  }

  async rejectTrainer(trainerId: string, reason: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.updateById(trainerId, {
      isVerified: false,
      verificationStatus: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date(),
    });

    await this.mailService.sendMail(trainer.email, 'reject', this.url);
    return trainer;
  }

  private getRepoByRole(
    role: 'user' | 'trainer',
  ): IUserRepository | ITrainerRepository {
    if (role === 'user') return this.userRepository;
    if (role === 'trainer') return this.trainerRepository;
    throw new NotFoundException('Invalid role specified');
  }
}
