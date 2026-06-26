import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateListingDto {
  @ApiPropertyOptional({ example: 349, description: 'Updated selling price (INR)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 25, description: 'Updated stock quantity', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: false, description: 'Toggle listing active/inactive' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
