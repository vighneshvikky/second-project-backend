import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { UpdateUserDto } from '../dtos/user.dto';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Trainer } from 'src/trainer/schemas/trainer.schema';
import { NotBlockedGuard } from 'src/common/guards/notBlocked.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard, RolesGuard, NotBlockedGuard)
  @Roles('user')
  @Patch('update-profile')
  async updateUser(
    @GetUser('sub') userId: string,
    @Body() updateData: UpdateUserDto,
  ) {
    return await this.userService.findByIdAndUpdate(userId, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, NotBlockedGuard)
  @Roles('user')
  @Get('approved-trainer')
  async getApprovedTrainer(
    @Query('category') category?: string,
    @Query('name') name?: string,
  ): Promise<Trainer[]> {
    console.log('category', category);

    return await this.userService.findApprovedTrainer({ category, name });
  }

  @UseGuards(JwtAuthGuard, RolesGuard, NotBlockedGuard)
  @Roles('user')
  @Get('getTrainerData/:id')
  getTrainerData(@Param('id') id: string): Promise<Trainer | null> {
    return this.userService.findTrainer(id);
  }
}
