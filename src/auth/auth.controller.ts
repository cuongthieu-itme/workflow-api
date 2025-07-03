import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgetPasswordDTO,
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
    summary: 'Login',
  })
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register',
  })
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Patch('forget-password')
  @ApiOperation({
    summary: 'Forget password',
  })
  forgetPassword(@Body() dto: ForgetPasswordDTO) {
    return this.authService.forgetPassword(dto);
  }

  @Patch('verify-account')
  @ApiOperation({
    summary: 'Verify account',
  })
  verifyAccount(@Body() dto: VerifyAccountDTO) {
    return this.authService.verifyAccount(dto);
  }

  @Get('me')
  @AuthGuard()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get me',
  })
  getMe(@Request() req: AuthRequest) {
    return this.authService.getMe(req.user.id);
  }
}
