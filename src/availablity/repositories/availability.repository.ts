import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Availability } from '../schemas/availablity.schema';
import { IAvailabilityRepository } from '../interface/availability-repository.interface';

@Injectable()
export class AvailabilityRepository extends BaseRepository<Availability> implements IAvailabilityRepository{
  constructor(@InjectModel(Availability.name) model: Model<Availability>) {
    super(model);
  }

  async findByTrainerAndDate(trainerId: string, date: string) {
    return this.model.findOne({ trainerId, date }).exec();
  }

  async upsertAvailability(trainerId: string, date: string, slots: string[]) {
    return this.model.findOneAndUpdate(
      { trainerId, date },
      { $set: { slots } },
      { upsert: true, new: true }
    ).exec();
  }

  async getAllForTrainer(trainerId: string) {
    return this.model.find({ trainerId }).exec();
  }
}
