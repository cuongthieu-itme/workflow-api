import { Queue } from 'bullmq';
import { RequestPasswordResetQueuePayloadDTO } from 'src/queue/auth-queue-services/request-password-reset-email-queue-processor.service';

export const RequestPasswordResetNotification = () => {
  return (_: any, __: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
      const queue = this.requestPasswordResetEmailQueueService as Queue;
      const result = await originalMethod.apply(this, args);

      // Generate reset token for email
      const resetToken = this.tokenService.generatePasswordResetToken(
        args[0].email,
      );

      queue.add(
        'send-email',
        new RequestPasswordResetQueuePayloadDTO(args[0].email, resetToken),
      );
      return result;
    };
    return descriptor;
  };
};
