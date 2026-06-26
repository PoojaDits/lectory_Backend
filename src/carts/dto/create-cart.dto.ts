import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6g7h8i9j0k1', description: 'Customer user ID who owns this cart' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
