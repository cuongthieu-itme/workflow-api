import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { SendEmailDTO } from 'src/notification/dtos';
import { UserService } from 'src/user/user.service';
import { QueueKeys } from 'src/queue/queue-keys.constant';

export class LoginEmailQueuePayloadDTO {
  constructor(public email: string) {}
}

@Processor(QueueKeys.LoginEmailQueue)
export class LoginEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {
    super();
  }

  async process({ data }: Job<LoginEmailQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserByEmail(data.email);

    const sendEmailPayload = new SendEmailDTO(
      user.email,
      'Phát hiện đăng nhập vào tài khoản của bạn',
      `${user.fullName}, đã có người đăng nhập vào tài khoản của bạn lúc ${user.lastLoginDate}. Nếu không phải bạn, vui lòng đổi mật khẩu ngay.`,
    );

    this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, sendEmailPayload);
  }
}
