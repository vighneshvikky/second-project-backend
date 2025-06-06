import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { UpdateUserDto } from '../dtos/user.dto';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Patch('update-profile')
  async updateUser(
    @GetUser('sub') userId: string,
    @Body() updateData: UpdateUserDto ,
  ) {
    return await this.userService.findByIdAndUpdate(userId, updateData);
  }
}
