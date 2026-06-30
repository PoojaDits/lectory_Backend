import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/constants';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ minLength: 8, example: 'NewPassword123!' })
  @IsString()
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  newPassword: string;
}
