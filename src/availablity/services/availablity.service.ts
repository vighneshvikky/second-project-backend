import { Inject, Injectable } from '@nestjs/common';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from '../interface/availability-repository.interface';
import { CreateAvailabilityDto } from '../dto/availablity.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
  ) {}

  createOrUpdateAvailability(trainerId: string, dto: CreateAvailabilityDto) {
    return this.availabilityRepo.upsertAvailability(
      trainerId,
      dto.date,
      dto.slots,
    );
  }

  getTrainerAvailability(trainerId: string) {
    return this.availabilityRepo.getAllForTrainer(trainerId);
  }

  getTrainerAvailabilityBasedonDate(traineId: string, date: string) {
    return this.availabilityRepo.findByTrainerAndDate(traineId, date)
  }
}
