import { IsOptional, IsString, IsArray, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  // Expecting an ISO date string (e.g., "2006-03-06T00:00:00.000Z")
  @IsDateString()
  dob: string;

  // If height is really a date string, use IsDateString() - otherwise, change to a number or a string validator.
  @IsDateString()
  height: string;

  @IsString()
  heightUnit: string;

  // Same note as for height; change to number if needed
  @IsDateString()
  weight: string;

  @IsString()
  weightUnit: string;

  @IsString()
  fitnessLevel: string;

  @IsArray()
  @IsString({ each: true })
  fitnessGoals: string[];

  @IsArray()
  @IsString({ each: true })
  trainingTypes: string[];

  @IsString()
  workoutsPerWeek: string;

  @IsString()
  preferredTime: string;

  @IsArray()
  @IsString({ each: true })
  equipments: string[];
}
