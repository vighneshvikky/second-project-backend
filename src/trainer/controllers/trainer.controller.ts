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
import { TrainerService } from '../services/trainer.service';
import {  UpdateTrainerProfileDto } from '../dtos/trainer.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from '../../common/aws/services/aws-s3.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('trainers')
export class TrainerController {
  constructor(
    private readonly trainerService: TrainerService,
  ) {}

  @Patch('profile/:id')
  async updateTrainerProfile(
    @Param('id') trainerId: string,
    @Body() dto: any,
  ) {
    console.log('data form trainer profile', dto)
    return this.trainerService.updateTrainerProfile(trainerId, dto);
  }
}
