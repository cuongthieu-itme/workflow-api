import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RequestPasswordResetDTO,
  ResetPasswordDTO,
  LoginDTO,
  RegisterDTO,
  VerifyAccountDTO,
} from './dtos';
import { AuthGuard } from 'src/common/decorators/auth-guard.decorator';
import { AuthRequest } from 'src/common/types';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập',
  })
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký',
  })
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Post('request-password-reset')
  @ApiOperation({
    summary: 'Yêu cầu đặt lại mật khẩu',
  })
  requestPasswordReset(@Body() dto: RequestPasswordResetDTO) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
  })
  resetPassword(@Query('token') token: string, @Body() dto: ResetPasswordDTO) {
    return this.authService.resetPassword(token, dto);
  }

  @Patch('verify-account')
  @ApiOperation({
    summary: 'Xác thực tài khoản',
  })
  updateVerificationState(@Body() dto: VerifyAccountDTO) {
    return this.authService.updateVerificationState(dto);
  }

  @Get('me')
  @AuthGuard()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lấy thông tin người dùng hiện tại',
  })
  getMe(@Request() req: AuthRequest) {
    return this.authService.getMe(req.user.id);
  }
}
