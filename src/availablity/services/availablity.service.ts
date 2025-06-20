import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

async createOrUpdateAvailability(trainerId: string, dto: CreateAvailabilityDto) {
  const { date, slots } = dto;

  const existing = await this.availabilityRepo.findByTrainerAndDate(trainerId, date);

  function hasConflict(a: { start: string; end: string }, b: { start: string; end: string }) {
    return a.start < b.end && b.start < a.end;
  }

  if (existing) {
    for (const newSlot of slots) {
      for (const existingSlot of existing.slots) {
        if (hasConflict(newSlot, existingSlot)) {
          throw new BadRequestException(
            `Slot ${newSlot.start}-${newSlot.end} conflicts with existing slot ${existingSlot.start}-${existingSlot.end}`
          );
        }
      }
    }
  }

  return this.availabilityRepo.upsertAvailability(trainerId, date, slots);
}


  getTrainerAvailability(trainerId: string) {
    return this.availabilityRepo.getAllForTrainer(trainerId);
  }

  getTrainerAvailabilityBasedonDate(traineId: string, date: string) {
  
    return this.availabilityRepo.findByTrainerAndDate(traineId, date)
  }
}
