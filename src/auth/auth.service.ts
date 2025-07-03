import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  RequestPasswordResetDTO,
  ResetPasswordDTO,
  LoginDTO,
  RegisterDTO,
  GetMeResponseDTO,
  VerifyAccountDTO,
} from './dtos';
import { TokenService } from 'src/common/token/token.service';
import { UserService } from 'src/user/user.service';
import {
  ForgetPasswordNotification,
  LoginNotification,
  RegisterNotification,
} from './notification-decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueKeys } from 'src/queue/queue-keys.constant';
import { Queue } from 'bullmq';
import { VerifyAccountNotification } from './notification-decorator/verify-account-notification.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    @InjectQueue(QueueKeys.LoginEmailQueue)
    public readonly loginEmailQueueService: Queue,
    @InjectQueue(QueueKeys.RegisterEmailQueue)
    public readonly registerEmailQueueService: Queue,
    @InjectQueue(QueueKeys.ForgetPasswordEmailQueue)
    public readonly forgetPasswordEmailQueueService: Queue,
    @InjectQueue(QueueKeys.VerifyAccountEmailQueue)
    public readonly verifyAccountEmailQueueService: Queue,
  ) {}

  @RegisterNotification()
  async register(dto: RegisterDTO) {
    const user = await this.userService.createUser(dto);
    const accessToken = await this.tokenService.decodeAuthToken({
      userId: user.id,
      isVerifiedAccount: user.isVerifiedAccount,
      role: user.role,
    });
    return { accessToken };
  }

  @LoginNotification()
  async login(dto: LoginDTO) {
    const user = await this.userService.findUserByEmailOrUserNameAndPassword(
      dto.emailOrUserName,
      dto.password,
    );
    if (!user.isVerifiedAccount) {
      throw new BadRequestException(
        'Vui lòng chờ quản trị viên xác thực tài khoản trước.',
      );
    }
    const accessToken = await this.tokenService.decodeAuthToken({
      isVerifiedAccount: user.isVerifiedAccount,
      role: user.role,
      userId: user.id,
    });
    await this.userService.updateUserById(user.id, {
      lastLoginDate: new Date(),
    });
    return { accessToken };
  }

  @ForgetPasswordNotification()
  async requestPasswordReset(dto: RequestPasswordResetDTO) {
    // Verify user exists
    await this.userService.findUserByEmail(dto.email, true);

    // The reset token is generated and sent via email in the decorator
    return { message: 'Email reset password đã được gửi.' };
  }

  async resetPassword(token: string, dto: ResetPasswordDTO) {
    try {
      // Verify reset token
      const payload = this.tokenService.verifyPasswordResetToken(token);

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Token không hợp lệ.');
      }

      // Find user and update password
      const user = await this.userService.findUserByEmail(payload.email, true);
      await this.userService.updateUserById(user.id, {
        password: dto.newPassword,
      });

      return { message: 'Mật khẩu đã được thay đổi thành công.' };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn.');
      }
      throw error;
    }
  }

  @VerifyAccountNotification()
  async updateVerificationState(dto: VerifyAccountDTO) {
    await this.userService.updateVerificationState(
      dto.id,
      dto.isVerifiedAccount,
    );
  }

  async getMe(userId: number): Promise<GetMeResponseDTO> {
    const user = await this.userService.findUserById(userId);
    return new GetMeResponseDTO(user);
  }
}
