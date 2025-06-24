import {
  Controller,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TrainerService } from '../services/trainer.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { NotBlockedGuard } from 'src/common/guards/notBlocked.guard';
@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Patch('update-trainer-profile')
  @UseGuards(JwtAuthGuard, RolesGuard, NotBlockedGuard)
  @Roles('trainer')
  async updateTrainerProfile(
    @GetUser('sub') trainerId: string,
    @Body() dto: any,
  ) {
     console.log('trainer data', dto)
    return this.trainerService.updateTrainerProfile(trainerId, dto);
  }
}
