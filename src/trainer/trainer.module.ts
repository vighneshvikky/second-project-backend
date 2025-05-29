import { Module } from '@nestjs/common';
import { TrainerController } from './controllers/trainer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trainer, TrainerSchema } from './schemas/trainer.schema';
import { TrainerRepository } from './repositories/trainer.repository';
import { TrainerService } from './services/trainer.service';
import { AwsS3Service } from 'src/common/aws/services/aws-s3.service';

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
