import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import { AVAILABILITY_SERVICE, IAvailabilityService } from '../interface/availability-service.interface';
import { Availability } from '../schemas/availablity.schema';

@Controller('availability')
export class AvailabilityController {
  
  constructor(@Inject(AVAILABILITY_SERVICE) private readonly availabilityService: IAvailabilityService) {}


  @Post('set-availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('trainer')
async setAvailability(
  @GetUser('sub') trainerId: string,
  @Body() createAvailabilityDto: any,
) {
  console.log('data', createAvailabilityDto)
  const data = await this.availabilityService.createOrUpdateAvailability(
    trainerId,
    createAvailabilityDto
  );
 return  data;
}

  @Get('default-slots')
  async getDefaultSlots(@GetUser('sub') trainerId: string): Promise<Availability[]> {
    return this.availabilityService.getDefaultSlotsForTrainer(trainerId);
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
