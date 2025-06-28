import { CreateTrainerProfileDto } from '../dtos/create-trainer.dto';
import { UpdateTrainerProfileDto } from '../dtos/trainer.dto';
import { Trainer } from '../schemas/trainer.schema';

export const TRAINER_SERVICE = 'TRAINER_SERVICE'

export interface ITrainerService {
  findByEmail(email: string): Promise<Trainer | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  create(payload: Partial<Trainer>): Promise<Trainer>;
  createTrainerWithFiles(data: {
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    experience: number;
    bio: string;
    idProofUrl: string;
    certificationUrl: string;
    verificationStatus: string;
  }): Promise<Trainer>;
  findById(id: string): Promise<Trainer | null>;
  updateTrainerProfile(trainerId: string, dto: UpdateTrainerProfileDto): Promise<Trainer>;


}
