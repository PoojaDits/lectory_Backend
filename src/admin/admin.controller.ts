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
import { AdminsService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: create a new admin user' })
  @ApiBody({ description: 'Admin data including email, name, password' })
  async create(@Body() createAdminDto: any) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: list all admin users' })
  async findAll() {
    return this.adminsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current logged-in admin profile' })
  async findMe(@CurrentUser('userId') userId: string) {
    const admin = await this.adminsService.findByUserId(userId);
    if (!admin) return null;
    return admin;
  }


  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin: marketplace dashboard summary counts' })
  async dashboardSummary() {
    return this.adminsService.dashboardSummary();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiOperation({ summary: 'Admin: get a specific admin by ID' })
  async findOne(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiOperation({ summary: 'Admin: update an admin profile' })
  @ApiBody({ description: 'Partial admin data to update' })
  async update(@Param('id') id: string, @Body() updateAdminDto: any) {
    return this.adminsService.update(id, updateAdminDto);
  }
}
