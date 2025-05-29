import { IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MaxLength, Min } from "class-validator";

export class TrainingRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsNumber()
  @Min(0)
  experience: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;


  @IsOptional()
@IsString()
idProof?: string;

@IsOptional()
@IsString()
certification?: string;

}



