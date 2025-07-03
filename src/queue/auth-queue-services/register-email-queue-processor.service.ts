import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserService } from 'src/user/user.service';
import { SendEmailDTO } from 'src/notification/dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { QueueKeys } from '../queue-keys.constant';

export class RegisterEmailQueuePayloadDTO {
  constructor(public email: string) {}
}

@Processor(QueueKeys.RegisterEmailQueue)
export class RegisterEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process({ data }: Job<RegisterEmailQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserByEmail(data.email);
    const payload = new SendEmailDTO(
      user.email,
      'Welcome to our e-commerce application',
      `E-commerce is a platform to manage your products and sell them as a vendor and also give you a report about your income. For using this platform first you should verify your account. Your verification code is ${user.verifiedToken}`,
    );
    this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, payload);
  }
}
