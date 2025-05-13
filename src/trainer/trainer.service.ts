import { Injectable } from '@nestjs/common';
import { TrainerRepository } from './trainer.repository';
import { Trainer } from './schemas/trainer.schema';

@Injectable()
export class TrainerService {
  constructor(readonly trainerRepo: TrainerRepository) {}

  async findByEmail(email: string): Promise<Trainer | null> {
    return this.trainerRepo.findByEmail(email);
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.trainerRepo.updatePassword(userId, newPassword);
  }

}
