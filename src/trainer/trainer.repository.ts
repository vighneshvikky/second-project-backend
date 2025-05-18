import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trainer } from './schemas/trainer.schema';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class TrainerRepository extends BaseRepository<Trainer> {
  constructor(@InjectModel(Trainer.name) model: Model<Trainer>) {
    super(model);
  }

  async findByEmail(email: string): Promise<Trainer | null> {
    return this.model.findOne({ email }).exec();
  }

  async create(data: Partial<Trainer>): Promise<Trainer> {
    return this.model.create(data);
  }

  async updatePassword(trainerId: string, newPassword: string) {
    await this.model
      .updateOne({ _id: trainerId }, { $set: { password: newPassword } })
      .exec();
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
    return this.create({
      ...data,
      role: 'trainer',
    });
  }

  async findById(id: string): Promise<Trainer | null> {
    return this.model.findById(id).exec();
  }

  async updateTrainerWithFiles(id: string, data: {
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    experience: number;
    bio: string;
    idProofUrl: string;
    certificationUrl: string;
  }): Promise<Trainer | null> {
    return this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
  }
}
