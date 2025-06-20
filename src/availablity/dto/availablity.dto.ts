import { IsArray, IsDateString, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class CreateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];
}
