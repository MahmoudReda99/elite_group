import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
  return request.user;
});
