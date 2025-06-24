import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/services/user.service';
import { TrainerService } from 'src/trainer/services/trainer.service';

@Injectable()
export class NotBlockedGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly trainerService: TrainerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.sub || !user.role) {
      throw new ForbiddenException('User data is incomplete or missing');
    }

    if (user.role === 'user') {

      const dbUser = await this.userService.findById(user.sub);
    
      if (!dbUser || dbUser.isBlocked) {
        throw new ForbiddenException('User is blocked or not found');
      }
    } else if (user.role === 'trainer') {
      const dbTrainer = await this.trainerService.findById(user.sub);
      if (!dbTrainer || dbTrainer.isBlocked) {
        throw new ForbiddenException('Trainer is blocked or not found');
      }
    } else {
      throw new ForbiddenException('Invalid user role');
    }

    return true;
  }
}
