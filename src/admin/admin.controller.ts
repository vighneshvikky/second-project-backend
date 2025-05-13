import { Body, Controller, Post, Res, Get, Query, Patch, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';

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
  async login(@Body() loginDto: AdminLoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.adminService.verifyAdminLogin(
      loginDto.email,
      loginDto.password,
    );

    
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return {
      message: 'Admin login successful',
      refreshToken, 
    };
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const params: GetUsersQuery = {
      search: search || '',
      role: role && (role === 'user' || role === 'trainer') ? role : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
     
    const data = await this.adminService.getUsers(params);
   return data;
  }

  @Patch('users/:id/toggle-block')
  async toggleBlockStatus(
    @Param('id') id: string,
    @Query('role') role: 'user' | 'trainer'
  ) {
    return this.adminService.toggleBlockStatus(id, role);
  }
} 