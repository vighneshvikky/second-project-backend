import { CreateAvailabilityDto } from "../dto/availablity.dto";

export const AVAILABILITY_SERVICE = 'AVAILABILITY_SERVICE';


export interface IAvailabilityService {
  createOrUpdateAvailability(trainerId: string, dto: CreateAvailabilityDto): Promise<any>;
  getTrainerAvailability(trainerId: string): Promise<any>;
  getTrainerAvailabilityBasedonDate(trainerId: string, date: string): Promise<any>;
}