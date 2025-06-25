import { CreateAvailabilityDto } from "../dto/availablity.dto";
import { ObjectId } from 'mongodb';
import { Availability } from "../schemas/availablity.schema";

export const AVAILABILITY_SERVICE = 'AVAILABILITY_SERVICE';


export interface IAvailabilityService {
  createOrUpdateAvailability(trainerId: string, dto: CreateAvailabilityDto): Promise<Availability>;
  getTrainerAvailability(trainerId: string): Promise<any>;
  getTrainerAvailabilityBasedonDate(trainerId: string, date: string): Promise<any>;
}



export interface TimeSlot {
  _id: ObjectId;
  start: string;
  end: string;
}

export interface TrainerAvailability {
  _id: ObjectId;
  trainerId: ObjectId;
  date: Date;
  slots: TimeSlot[];
}
