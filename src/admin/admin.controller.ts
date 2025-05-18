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
import { AdminService } from './admin.service';
import { Response } from 'express';
import { GetUsersQueryDto } from 'src/common/helpers/dtos/get-user-query.dto';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorator/role.decorator';

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
    @Body() loginDto: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    
    const { accessToken, refreshToken } =
      await this.adminService.verifyAdminLogin(
        loginDto.email,
        loginDto.password,
      );

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

        response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Admin login successful',
      data: {
        id: '1234',
        email: loginDto.email,
        role: 'admin'
      }
    };
  }

//   @Get('users')
// async getUsers(@Query() query: GetUsersQueryDto) {
//   return this.adminService.getUsers(query);
// }

  @Get('users')
  async getUsers(
 @Query() query: GetUsersQueryDto
  ) {
    // const params: GetUsersQuery = {
    //   search: search || '',
    //   role: role && (role === 'user' || role === 'trainer') ? role : undefined,
    //   page: page ? Number(page) : 1,
    //   limit: limit ? Number(limit) : 10,
    // };

    // const data = await this.adminService.getUsers(params);
    // return data;

    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/toggle-block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async toggleBlockStatus(
    @Param('id') id: string,
    @Query('role') role: 'user' | 'trainer',
  ) {
    return this.adminService.toggleBlockStatus(id, role);
  }



  @Get('listTrainers')
  async listTrainers(
   @Query() query: GetUsersQueryDto
  ) {
    console.log('list traineer query', query);
    const data = await this.adminService.getUnverifiedTrainers(query);
    console.log('list traineer data', data);
    return data;
  }


  @Patch('verify-trainer/:trainerId')
async approveTrainer(@Param('trainerId') trainerId: string) {
  return this.adminService.approveTrainer(trainerId);
}


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
