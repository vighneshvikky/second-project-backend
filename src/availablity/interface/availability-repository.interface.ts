import { Availability } from '../schemas/availablity.schema';

export const AVAILABILITY_REPOSITORY = Symbol('AVAILABILITY_REPOSITORY');

export interface IAvailabilityRepository {
  create(data: Partial<Availability>): Promise<Availability>;
  findById(id: string): Promise<Availability | null>;
  findOne(filter: Record<string, any>): Promise<Availability | null>;
  findAll(filter?: Record<string, any>): Promise<Availability[]>;

  findByTrainerAndDate(
    trainerId: string,
    date: string,
  ): Promise<Availability | null>;
  upsertAvailability(
    trainerId: string,
    date: string,
    slots: string[],
  ): Promise<Availability>;
  getAllForTrainer(trainerId: string): Promise<Availability[]>;
}
