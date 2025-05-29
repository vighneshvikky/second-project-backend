import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Query,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { Response } from 'express';
import { GetUsersQueryDto } from 'src/common/helpers/dtos/get-user-query.dto';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { setTokenCookies } from 'src/common/helpers/token.setter';
import { LoginAdminDto } from 'src/auth/dto/admin.dto';

class AdminLoginDto {
  email: string;
  password: string;
}

interface GetUsersQuery {
  search?: string;
  role?: 'user' | 'trainer';
  page?: number;
  limit?: number;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginAdminDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.adminService.verifyAdminLogin(
        loginDto.email,
        loginDto.password,
      );
    console.log('acces', accessToken);
    console.log('refresh', refreshToken);
    setTokenCookies(response, accessToken, refreshToken);
    return {
      message: 'Admin login successful',
      data: {
        id: 'f123456',
        email: loginDto.email,
        role: 'admin',
      },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async getUsers(@Query() query: GetUsersQueryDto) {
    
    return this.adminService.getUsers(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
 @Patch('users/:id/toggle-block')
async toggleBlockStatus(
  @Param('id') id: string,
  @Query('role') role: 'user' | 'trainer',
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Query('search') search: string,
) {
  console.log('role', role)
  await this.adminService.toggleBlockStatus(id, role);
  return this.adminService.getUsers({ page, limit, search });
}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('listTrainers')
  async listTrainers(@Query() query: GetUsersQueryDto) {
    const data = await this.adminService.getUnverifiedTrainers(query);
    return data;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('verify-trainer/:trainerId')
  async approveTrainer(@Param('trainerId') trainerId: string) {
    return this.adminService.approveTrainer(trainerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('reject-trainer/:trainerId')
  async rejectTrainer(
    @Param('trainerId') trainerId: string,
    @Body('reason') reason: string,
  ) {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Rejection reason is required');
    }

    return this.adminService.rejectTrainer(trainerId, reason);
  }
}
