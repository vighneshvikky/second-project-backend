
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: keyof import('../../auth/interfaces/token-payload.interface').TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
      console.log('👤 request.user in @GetUser:', request.user);
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
