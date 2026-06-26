import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateMeDto } from '../sellers/dto';
import { UpdateUserStatusDto } from '../sellers/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { AuthUser } from '../common/interfaces';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get logged-in user auth record' })
  getMe(@CurrentUser('userId') userId: string) {
    return this.usersService.getByIdOrFail(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update logged-in user profile (password, names, etc.)' })
  updateMe(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateMeDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: list all auth users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'User auth id' })
  @ApiOperation({ summary: 'Admin: get auth user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.getByIdOrFail(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'User auth id' })
  @ApiOperation({ summary: 'Admin: activate/deactivate user auth account' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateActiveStatus(id, dto.isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'User auth id' })
  @ApiOperation({ summary: 'Admin: delete auth user' })
  async deleteUser(@Param('id') id: string, @CurrentUser() authUser: AuthUser) {
    if (authUser.userId === id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    await this.usersService.deleteUser(id);
  }
}
