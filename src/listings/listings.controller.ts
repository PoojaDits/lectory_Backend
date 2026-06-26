import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new listing for a book (seller)' })
  @ApiBody({ type: CreateListingDto, description: 'Listing data: bookId, price, stock, active' })
  async create(
    @Body() dto: CreateListingDto,
    @CurrentUser() authUser: AuthUser,
  ) {
    return this.listingsService.create({
      bookId: dto.bookId,
      sellerId: authUser.userId,
      price: dto.price,
      stock: dto.stock,
      active: dto.active,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all listings (public, filterable by query)' })
  @ApiQuery({ name: 'bookId', required: false, description: 'Filter by book ID' })
  @ApiQuery({ name: 'sellerId', required: false, description: 'Filter by seller ID' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status (true/false)' })
  async findAll(
    @Query('bookId') bookId?: string,
    @Query('sellerId') sellerId?: string,
    @Query('active') active?: string,
  ) {
    const query: any = {};
    if (bookId) query.bookId = bookId;
    if (sellerId) query.sellerId = sellerId;
    if (active !== undefined) query.active = active === 'true';
    return this.listingsService.findAll(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current seller\'s own listings' })
  async findMine(@CurrentUser('userId') userId: string) {
    return this.listingsService.findBySellerId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single listing by ID' })
  @ApiParam({ name: 'id', description: 'Listing ID', example: '64a1b2c3d4e5f6g7h8i9j0k1' })
  async findOne(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Listing ID', example: '64a1b2c3d4e5f6g7h8i9j0k1' })
  @ApiOperation({ summary: 'Update a listing (price, stock, active). Seller can only update their own.' })
  @ApiBody({ type: UpdateListingDto, description: 'Fields to update: price, stock, active' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser() authUser: AuthUser,
  ) {
    return this.listingsService.update(id, dto, { userId: authUser.userId, role: authUser.role });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Listing ID', example: '64a1b2c3d4e5f6g7h8i9j0k1' })
  @ApiOperation({ summary: 'Delete a listing. Seller can only delete their own.' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() authUser: AuthUser,
  ) {
    await this.listingsService.delete(id, { userId: authUser.userId, role: authUser.role });
  }
}
