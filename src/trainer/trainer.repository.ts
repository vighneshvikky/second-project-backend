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
}
