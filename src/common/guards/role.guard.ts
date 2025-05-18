import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      // No roles specified, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // This assumes JwtAuthGuard has already validated JWT and set req.user

    return requiredRoles.includes(user.role);
  }
}
