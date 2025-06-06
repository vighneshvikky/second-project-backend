import { Module } from '@nestjs/common';
import { TrainerController } from './controllers/trainer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trainer, TrainerSchema } from './schemas/trainer.schema';
import { TrainerRepository } from './repositories/trainer.repository';
import { TrainerService } from './services/trainer.service';
import { AwsS3Service } from 'src/common/aws/services/aws-s3.service';
import { ITrainerRepository } from './interfaces/trainer-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Trainer.name,
        schema: TrainerSchema,
      },
    ]),
  ],
  controllers: [TrainerController],
  providers: [
    TrainerRepository,
    {
      provide: ITrainerRepository,
      useClass: TrainerRepository,
    },
    TrainerService,
    AwsS3Service,
  ],
  exports: [{provide: ITrainerRepository, useClass: TrainerRepository}, TrainerService],
})
export class TrainerModule {}
