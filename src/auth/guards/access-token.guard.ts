import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/common/token/token.service';
import { AuthRequest } from 'src/common/types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as AuthRequest;
    const headerToken = request.header('Authorization');
    if (!headerToken) {
      throw new UnauthorizedException('Token xác thực không được cung cấp.');
    }
    const [bearer, token] = headerToken.split(' ');
    if (!bearer || bearer.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException(
        'Format token không hợp lệ. Vui lòng sử dụng Bearer token.',
      );
    }

    const verifiedToken = this.tokenService.verifyToken(token);
    if (!verifiedToken) {
      throw new UnauthorizedException(
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      );
    }

    const loggedInUser = await this.userService.findUserById(
      verifiedToken.userId,
    );
    if (!loggedInUser.isVerifiedAccount) {
      throw new UnauthorizedException(
        'Tài khoản của bạn chưa được xác thực. Vui lòng liên hệ quản trị viên.',
      );
    }
    request.user = loggedInUser;
    return true;
  }
}
