import {
  Controller,
  Post,
  Param,
  Req,
  UploadedFiles,
  Body,
  BadRequestException,
  UseInterceptors,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TrainerService } from './trainer.service';
import { TrainingRequest } from './trainer.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from '../common/services/aws-s3.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly trainerService: TrainerService,
  ) {}

  @Patch('profile/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idProof', maxCount: 1 },
      { name: 'certification', maxCount: 1 },
    ]),
  )
  async updateTrainerProfile(
    @Param('id') trainerId: string,
    @Body() dto: any,
    @UploadedFiles()
    files: {
      idProof?: Express.Multer.File[];
      certification?: Express.Multer.File[];
    },
  ) {
    return this.trainerService.updateTrainerProfile(trainerId, dto, files);
  }
}
