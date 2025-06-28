import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AVAILABILITY_REPOSITORY,
  IAvailabilityRepository,
} from '../interface/availability-repository.interface';
import { CreateAvailabilityDto } from '../dto/availablity.dto';
import * as dayjs from 'dayjs';
import { IAvailabilityService } from '../interface/availability-service.interface';
import { Availability } from '../schemas/availablity.schema';


@Injectable()
export class AvailabilityService implements IAvailabilityService{
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
  ) {}

async createOrUpdateAvailability(trainerId: string, dto: CreateAvailabilityDto) {
  const { date, slots } = dto;

  const now = dayjs();
  const isToday = dayjs(date).isSame(now, 'day');

  const existing = await this.availabilityRepo.findByTrainerAndDate(trainerId, date);

  function hasConflict(a: { start: string; end: string }, b: { start: string; end: string }) {
    return a.start < b.end && b.start < a.end;
  }


  for(const slot of slots){
    if(isToday){
      const slotStart = dayjs(`${date}T${slot.start}`);
      if(slotStart.isBefore(now)){
         throw new BadRequestException(`Slot ${slot.start}-${slot.end} is in the past.`);
      }
    }

    if(slot.start >= slot.end){
      throw new BadRequestException(`Invalid time range: ${slot.start} >= ${slot.end}`)
    }
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


  getTrainerAvailability(trainerId: string): Promise<Availability[]> {
    return this.availabilityRepo.getAllForTrainer(trainerId);
  }

  getTrainerAvailabilityBasedonDate(traineId: string, date: string): Promise<Availability | null> {
  
    return this.availabilityRepo.findByTrainerAndDate(traineId, date)
  }
}
