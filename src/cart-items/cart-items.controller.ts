import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('cart-items')
@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a listing to the cart (merges quantity if same listing already present)' })
  @ApiBody({ type: CreateCartItemDto, description: 'Cart item data with book snapshots' })
  async create(@Body() dto: CreateCartItemDto) {
    return this.cartItemsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get cart items (public, filterable by cartId)' })
  @ApiQuery({ name: 'cartId', required: false, description: 'Filter by cart ID' })
  @ApiQuery({ name: 'listingId', required: false, description: 'Filter by listing ID' })
  async findAll(
    @Query('cartId') cartId?: string,
    @Query('listingId') listingId?: string,
  ) {
    const query: any = {};
    if (cartId) query.cartId = cartId;
    if (listingId) query.listingId = listingId;
    return this.cartItemsService.findAll(query);
  }

  @Get('cart/:cartId')
  @ApiOperation({ summary: 'Get all items inside a specific cart' })
  @ApiParam({ name: 'cartId', description: 'Cart ID', example: '64a1b2c3d4e5f6g7h8i9j0k1' })
  async findByCartId(@Param('cartId') cartId: string) {
    return this.cartItemsService.findByCartId(cartId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single cart item by ID' })
  @ApiParam({ name: 'id', description: 'Cart item ID', example: '64a1b2c3d4e5f6g7h8i9j0k2' })
  async findOne(@Param('id') id: string) {
    return this.cartItemsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quantity of a cart item (clamped to minimum 1)' })
  @ApiParam({ name: 'id', description: 'Cart item ID', example: '64a1b2c3d4e5f6g7h8i9j0k2' })
  @ApiBody({ type: UpdateCartItemDto, description: 'New absolute quantity' })
  async update(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartItemsService.update(id, dto.quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a single cart item' })
  @ApiParam({ name: 'id', description: 'Cart item ID', example: '64a1b2c3d4e5f6g7h8i9j0k2' })
  async delete(@Param('id') id: string) {
    await this.cartItemsService.delete(id);
  }
}
