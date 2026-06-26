import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({ example: '64a1b2c3d4e5f6g7h8i9j0k1', description: 'Cart ID this item belongs to' })
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @ApiProperty({ example: '64a1b2c3d4e5f6g7h8i9j0k2', description: 'Seller listing ID' })
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @ApiProperty({ example: '64a1b2c3d4e5f6g7h8i9j0k3', description: 'Book ID' })
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({ example: '64a1b2c3d4e5f6g7h8i9j0k4', description: 'Seller user ID' })
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ example: 2, description: 'Quantity to add', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 399, description: 'Unit price at the time of adding', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'The Midnight Library', description: 'Book title snapshot' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Matt Haig', description: 'Book author snapshot' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg', description: 'Book cover image URL snapshot' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ example: 'My Book Store', description: 'Seller name snapshot' })
  @IsString()
  @IsNotEmpty()
  sellerName: string;
}
