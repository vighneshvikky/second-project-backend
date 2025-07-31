import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsNumber,
  ValidateNested,
  IsIn,
} from 'class-validator';

class PricingDto {
  @IsNumber()
  @IsOptional()
  oneToOneSession?: number;

  @IsNumber()
  @IsOptional()
  workoutPlan?: number;
}

export class UpdateTrainerProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  experience?: number;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'requested'])
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'requested';

  @IsOptional()
  @IsString()
  category?: string; // ✅ Added since it's part of your input DTO

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  certificationUrl?: string;

  @IsOptional()
  @IsString()
  idProofUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PricingDto)
  pricing?: PricingDto;
}
