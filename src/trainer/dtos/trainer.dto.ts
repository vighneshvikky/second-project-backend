import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Matches, MaxLength, Min } from "class-validator";





export class UpdateTrainerProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNumber()
  experience: number;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  certification?: string; 

  @IsOptional()
  @IsString()
  idProof?: string; 
}

