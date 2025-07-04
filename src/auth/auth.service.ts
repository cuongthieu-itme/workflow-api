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
  RequestPasswordResetNotification,
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
    @InjectQueue(QueueKeys.RequestPasswordResetEmailQueue)
    public readonly requestPasswordResetEmailQueueService: Queue,
    @InjectQueue(QueueKeys.VerifyAccountEmailQueue)
    public readonly verifyAccountEmailQueueService: Queue,
  ) {}

  @RegisterNotification()
  async register(dto: RegisterDTO) {
    const user = await this.userService.create(dto);

    const accessToken = await this.tokenService.decodeAuthToken({
      userId: user.id,
      isVerifiedAccount: user.isVerifiedAccount,
      role: user.role,
    });

    return { accessToken };
  }

  @LoginNotification()
  async login(dto: LoginDTO) {
    const user = await this.userService.loginOptimized(
      dto.emailOrUserName,
      dto.password,
    );

    if (!user.isVerifiedAccount) {
      throw new BadRequestException(
        'Vui lòng chờ quản trị viên xác thực tài khoản trước.',
      );
    }

    const [accessToken] = await Promise.all([
      this.tokenService.decodeAuthToken({
        isVerifiedAccount: user.isVerifiedAccount,
        role: user.role,
        userId: user.id,
      }),
      this.userService.updateLoginDate(user.id),
    ]);

    return { accessToken };
  }

  async getMe(userId: number): Promise<GetMeResponseDTO> {
    const user = await this.userService.findByIdOptimized(userId);
    return new GetMeResponseDTO(user);
  }

  @RequestPasswordResetNotification()
  async requestPasswordReset(dto: RequestPasswordResetDTO) {
    await this.userService.verifyEmailExists(dto.email);
    return { message: 'Email reset password đã được gửi.' };
  }

  @VerifyAccountNotification()
  async updateVerificationState(dto: VerifyAccountDTO) {
    await this.userService.updateVerification(dto.id, dto.isVerifiedAccount);
  }

  async resetPassword(token: string, dto: ResetPasswordDTO) {
    try {
      const payload = this.tokenService.verifyPasswordResetToken(token);

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Token không hợp lệ.');
      }

      await this.userService.resetPassword(payload.email, dto.newPassword);

      return { message: 'Mật khẩu đã được thay đổi thành công.' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          'Token đặt lại mật khẩu không hợp lệ. Vui lòng kiểm tra lại link trong email.',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Có lỗi xảy ra khi xác thực token. Vui lòng thử lại.',
      );
    }
  }
}
