import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart for a customer (idempotent — returns existing if already present)' })
  @ApiBody({ type: CreateCartDto, description: 'Customer user ID' })
  async create(@Body() dto: CreateCartDto) {
    return this.cartsService.create(dto.customerId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: list all carts' })
  async findAll() {
    return this.cartsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current logged-in customer\'s cart' })
  async findMe(@CurrentUser('userId') userId: string) {
    const cart = await this.cartsService.findByCustomerId(userId);
    if (!cart) return null;
    return cart;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Cart ID', example: '64a1b2c3d4e5f6g7h8i9j0k1' })
  @ApiOperation({ summary: 'Admin: get a cart by ID' })
  async findOne(@Param('id') id: string) {
    return this.cartsService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Cart ID', example: '64a1b2c3d4e5f6g7h8i9j0k1' })
  @ApiOperation({ summary: 'Admin: delete a cart by ID' })
  async delete(@Param('id') id: string) {
    await this.cartsService.delete(id);
  }
}
