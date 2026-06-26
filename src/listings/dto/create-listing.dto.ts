import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateListingDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6g7h8i9j0k1', description: 'Book ID to list for sale' })
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({ example: 399, description: 'Selling price (INR)', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, description: 'Available stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: true, description: 'Whether the listing is active', required: false })
  @IsBoolean()
  active?: boolean;
}
