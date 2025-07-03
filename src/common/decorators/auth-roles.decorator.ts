import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

export const AuthRoles = (...roles: UserRole[]) => {
  return applyDecorators(
    Roles(...roles),
    UseGuards(AccessTokenGuard, RoleGuard),
  );
};
