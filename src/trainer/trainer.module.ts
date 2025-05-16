import { Module } from '@nestjs/common';
import { TrainerController } from './trainer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trainer, TrainerSchema } from './schemas/trainer.schema';
import { TrainerRepository } from './trainer.repository';
import { TrainerService } from './trainer.service';
import { AwsS3Service } from 'src/common/services/aws-s3.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Trainer.name,
        schema: TrainerSchema,
      },
    ]),
  ],
  providers: [TrainerRepository, TrainerService, AwsS3Service],
  controllers: [TrainerController],
  exports: [TrainerRepository, TrainerService]
})
export class TrainerModule {}
