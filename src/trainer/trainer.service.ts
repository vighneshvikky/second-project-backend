import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainerRepository } from './trainer.repository';
import { Trainer } from './schemas/trainer.schema';
import { PasswordUtil } from 'src/common/helpers/password.util';
import { TrainingRequest } from './trainer.dto';
import { AwsS3Service } from 'src/common/services/aws-s3.service';

@Injectable()
export class TrainerService {
  constructor(readonly trainerRepo: TrainerRepository, readonly awsS3Service: AwsS3Service) {}

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


  async createTrainingRequest(dto: TrainingRequest): Promise<Trainer> {
    return this.trainerRepo.create(dto);
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

  async updateTrainerProfile(
    trainerId: string,
    dto: TrainingRequest,
    files: {
      idProof?: Express.Multer.File[];
      certification?: Express.Multer.File[];
    },
  ) {
    const trainer = await this.trainerRepo.findById(trainerId);
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    let idProofUrl = trainer.idProofUrl;
    let certificationUrl = trainer.certificationUrl;

    if (files.idProof && files.idProof[0]) {
      idProofUrl = await this.awsS3Service.uploadFile(files.idProof[0], 'id-proofs');
    }

    if (files.certification && files.certification[0]) {
      certificationUrl = await this.awsS3Service.uploadFile(files.certification[0], 'certifications');
    }

   const updatedTrainer = await this.trainerRepo.updateById(trainerId, {
    name: dto.name,
    email: dto.email,
    phoneNumber: dto.phoneNumber,
    specialization: dto.specialization,
    experience: dto.experience,
    bio: dto.bio || '',
    idProofUrl,
    certificationUrl,
    isVerified: false,
    verificationStatus: 'pending',
  });

  return updatedTrainer;
  }


}
