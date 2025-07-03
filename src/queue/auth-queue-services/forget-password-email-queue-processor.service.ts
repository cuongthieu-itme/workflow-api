import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from 'src/user/user.service';
import { SendEmailDTO } from 'src/notification/dtos';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { QueueKeys } from '../queue-keys.constant';
import { TokenService } from 'src/common/token/token.service';

export class ForgetPasswordQueuePayloadDTO {
  constructor(
    public email: string,
    public resetToken: string,
  ) {}
}

@Processor(QueueKeys.ForgetPasswordEmailQueue)
export class ForgetPasswordEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {
    super();
  }

  async process({ data }: Job<ForgetPasswordQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserByEmail(data.email);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}`;

    const sendEmailPayload = new SendEmailDTO(
      user.email,
      'Reset mật khẩu tài khoản',
      `Xin chào ${user.fullName},

Bạn đã yêu cầu reset mật khẩu cho tài khoản của mình. 

Vui lòng click vào link dưới đây để thiết lập mật khẩu mới:
${resetLink}

Link này sẽ hết hạn sau 5 phút.

Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ hỗ trợ`,
    );

    this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, sendEmailPayload);
  }
}
