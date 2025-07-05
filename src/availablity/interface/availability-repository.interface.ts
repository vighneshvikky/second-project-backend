import { Availability } from '../schemas/availablity.schema';

export const AVAILABILITY_REPOSITORY = Symbol('AVAILABILITY_REPOSITORY');

export interface IAvailabilityRepository {
  create(data: Partial<Availability>): Promise<Availability>;
  findById(id: string): Promise<Availability | null>;

  findByTrainerAndDate(
    trainerId: string,
    date: string,
  ): Promise<Availability | null>;
  upsertAvailability(
    trainerId: string,
    date: string,
    slots: { start: string; end: string }[],
  ): Promise<Availability>;
  getAllForTrainer(trainerId: string): Promise<Availability[]>;
  getDefaultSlotsForTrainer(trainerId: string): Promise<Availability[]>;
}
