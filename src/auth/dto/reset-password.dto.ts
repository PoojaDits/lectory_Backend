import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/constants';

export class ResetPasswordDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '6-digit OTP', example: '123456' })
  @IsString({ message: VALIDATION_MESSAGES.OTP_REQUIRED })
  @Length(6, 6, { message: VALIDATION_MESSAGES.OTP_LENGTH })
  otp: string;

  @ApiProperty({ minLength: 8, example: 'NewPassword123!' })
  @IsString()
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  newPassword: string;
}
