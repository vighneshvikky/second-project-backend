import { Module } from '@nestjs/common';
import { TrainerController } from './trainer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trainer, TrainerSchema } from './schemas/trainer.schema';
import { TrainerRepository } from './trainer.repository';
import { TrainerService } from './trainer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Trainer.name,
        schema: TrainerSchema,
      },
    ]),
  ],
  providers: [TrainerRepository, TrainerService],
  controllers: [TrainerController],
  exports: [TrainerRepository, TrainerService]
})
export class TrainerModule {}
