import {
  Controller,
  Body,
  Patch,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TrainerService } from '../services/trainer.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { NotBlockedGuard } from 'src/common/guards/notBlocked.guard';
import { ITrainerService, TRAINER_SERVICE } from '../interfaces/trainer-service.interface';
import { UpdateTrainerProfileDto } from '../dtos/trainer.dto';
@Controller('trainers')
export class TrainerController {
  constructor(@Inject(TRAINER_SERVICE) private readonly trainerService: ITrainerService) {}

  @Patch('update-trainer-profile')
  @UseGuards(JwtAuthGuard, RolesGuard, NotBlockedGuard)
  @Roles('trainer')
  async updateTrainerProfile(
    @GetUser('sub') trainerId: string,
    @Body() dto: UpdateTrainerProfileDto,
  ) {
    return this.trainerService.updateTrainerProfile(trainerId, dto);
  }
}
