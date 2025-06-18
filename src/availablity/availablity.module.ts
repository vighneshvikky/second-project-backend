import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Availability, AvailabilitySchema } from './schemas/availablity.schema';
import { AvailabilityController } from './controller/availablity.controller';
import { AvailabilityService } from './services/availablity.service';
import { AvailabilityRepository } from './repositories/availability.repository';
import { AVAILABILITY_REPOSITORY } from './interface/availability-repository.interface';
import { IJwtTokenService } from 'src/auth/interfaces/ijwt-token-service.interface';
import { JwtTokenService } from 'src/auth/services/jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    {
      provide: AVAILABILITY_REPOSITORY,
      useClass: AvailabilityRepository,
    },
    {
      provide: IJwtTokenService,
      useClass: JwtTokenService,
    },
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
