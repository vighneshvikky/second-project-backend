import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAccountDto } from 'src/auth/dto/createAccount.dto';
import { Trainer } from './schemas/trainer.schema';

@Injectable()
export class TrainerRepository {
  constructor(@InjectModel('Trainer') private trainerModel: Model<Trainer>) {}
  async create(data: CreateAccountDto): Promise<Trainer> {
    const trainer = new this.trainerModel({
      ...data,
      role: 'trainer',
    });
    return trainer.save();
  }

  async findByEmail(email: string) {
    return this.trainerModel.findOne({ email, role: 'trainer' }).exec();
  }
}
