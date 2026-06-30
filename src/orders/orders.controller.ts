import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { AuthUser } from '../common/interfaces';
import { OrderStatus } from '../common/enums';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Customer: place an order for one seller' })
  create(@Body() dto: any, @CurrentUser() authUser: AuthUser) {
    return this.ordersService.create(dto, authUser);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiOperation({ summary: 'Admin: list orders, optionally filtered' })
  findAll(@Query('customerId') customerId?: string, @Query('sellerId') sellerId?: string) {
    if (customerId) return this.ordersService.findByCustomer(customerId);
    if (sellerId) return this.ordersService.findBySeller(sellerId);
    return this.ordersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Customer: get my orders' })
  findMyOrders(@CurrentUser('userId') userId: string) {
    return this.ordersService.findByCustomer(userId);
  }

  @Get('seller/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Seller: get my received orders' })
  findSellerOrders(@CurrentUser('userId') userId: string) {
    return this.ordersService.findBySeller(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get one order' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'Admin/Seller: update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: { status: OrderStatus },
    @CurrentUser() authUser: AuthUser,
  ) {
    return this.ordersService.updateStatus(id, dto.status, authUser);
  }
}
