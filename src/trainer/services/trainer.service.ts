import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TrainerRepository } from '../repositories/trainer.repository';
import { Trainer } from '../schemas/trainer.schema';
import { PasswordUtil } from 'src/common/helpers/password.util';
import {  UpdateTrainerProfileDto } from '../dtos/trainer.dto';
import { AwsS3Service } from 'src/common/aws/services/aws-s3.service';
import { ITrainerRepository } from '../interfaces/trainer-repository.interface';

@Injectable()
export class TrainerService {
  constructor(
    @Inject(ITrainerRepository)
    private readonly trainerRepo: ITrainerRepository,
    readonly awsS3Service: AwsS3Service,
  ) {}

  async findByEmail(email: string): Promise<Trainer | null> {
    return this.trainerRepo.findByEmail(email);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.trainerRepo.updatePassword(userId, newPassword);
  }

  async create(payload: Partial<Trainer>): Promise<Trainer> {
    if (payload.password) {
      payload.password = await PasswordUtil.hashPassword(payload.password);
    }
    return this.trainerRepo.create(payload);
  }



  async createTrainerWithFiles(data: {
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    experience: number;
    bio: string;
    idProofUrl: string;
    certificationUrl: string;
  }): Promise<Trainer> {
    return this.trainerRepo.createTrainerWithFiles(data);
  }

  async findById(id: string): Promise<Trainer | null> {
    return this.trainerRepo.findById(id);
  }

  async updateTrainerProfile(trainerId: string, dto: any) {
    const trainer = await this.trainerRepo.findById(trainerId);
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

 

    const updatedTrainer = await this.trainerRepo.updateById(trainerId, dto);

    return updatedTrainer;
  }
}
