import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from '../services/availablity.service';
import { CreateAvailabilityDto } from '../dto/availablity.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // @Post('set-availability')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('trainer')
  // setAvailability(
  //   @GetUser('sub') trainerId: string,
  //   @Body() dto: CreateAvailabilityDto,
  // ) {
  //   console.log('dto', dto)
  //   return this.availabilityService.createOrUpdateAvailability(trainerId, dto);
  // }
  @Post('set-availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('trainer')
async setAvailability(
  @GetUser('sub') trainerId: string,
  @Body() createAvailabilityDto: CreateAvailabilityDto,
) {
  console.log('data', createAvailabilityDto)
  return this.availabilityService.createOrUpdateAvailability(
    trainerId,
    createAvailabilityDto
  );
}



@Get('get-availability-trainer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('trainer')
getTrainerAvailabilityForTrainer(
  @GetUser('sub') trainerId: string,
  @Query('date') date: string,
) {

  return this.availabilityService.getTrainerAvailabilityBasedonDate(
    trainerId,
    date,
  );
}


  @Get('get-availability-user')
  getTrainerAvailabilityForUser(@Query('trainerId') trainerId: string) {
    return this.availabilityService.getTrainerAvailability(trainerId);
  }
}
