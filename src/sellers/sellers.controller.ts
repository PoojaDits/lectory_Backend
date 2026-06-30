import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: create a new seller user' })
  @ApiBody({ description: 'Seller data including email, businessName, contactPerson, mobileNumber, password' })
  async create(@Body() createSellerDto: any) {
    return this.sellersService.create(createSellerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: list all seller users' })
  async findAll() {
    return this.sellersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current logged-in seller profile' })
  async findMe(@CurrentUser('userId') userId: string) {
    const seller = await this.sellersService.findByUserId(userId);
    if (!seller) return null;
    return seller;
  }


  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Seller: update current logged-in seller profile' })
  @ApiBody({ description: 'Partial seller profile data' })
  async updateMe(@CurrentUser('userId') userId: string, @Body() updateSellerDto: any) {
    return this.sellersService.update(userId, updateSellerDto);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: list all sellers pending approval' })
  async findPending() {
    return this.sellersService.findPending();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Seller user ID' })
  @ApiOperation({ summary: 'Admin: get a specific seller by ID' })
  async findOne(@Param('id') id: string) {
    return this.sellersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Seller user ID' })
  @ApiOperation({ summary: 'Admin: update a seller profile' })
  @ApiBody({ description: 'Partial seller data to update' })
  async update(@Param('id') id: string, @Body() updateSellerDto: any) {
    return this.sellersService.update(id, updateSellerDto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Seller user ID' })
  @ApiOperation({ summary: 'Admin: approve a seller account' })
  async approve(@Param('id') id: string) {
    return this.sellersService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Seller user ID' })
  @ApiOperation({ summary: 'Admin: reject a seller account' })
  @ApiBody({ description: 'Optional rejection reason', type: Object })
  async reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.sellersService.reject(id, body?.reason);
  }
}
