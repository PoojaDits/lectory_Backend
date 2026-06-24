import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSellerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @IsString()
  mobileNumber?: string;
}