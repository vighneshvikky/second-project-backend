import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Matches, MaxLength, Min } from "class-validator";





export class UpdateTrainerProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  experience?: number;

  @IsOptional()
  @IsString()
  specialization?: string[];

  @IsOptional()
  @IsString()
  certification?: string; 

  @IsOptional()
  @IsString()
  idProof?: string; 
}

