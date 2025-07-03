import { Queue } from 'bullmq';
import { ForgetPasswordQueuePayloadDTO } from 'src/queue/auth-queue-services/forget-password-email-queue-processor.service';

export const ForgetPasswordNotification = () => {
  return (_: any, __: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
      const queue = this.forgetPasswordEmailQueueService as Queue;
      const result = await originalMethod.apply(this, args);

      const resetToken = this.tokenService.generatePasswordResetToken(
        args[0].email,
      );

      queue.add(
        'send-email',
        new ForgetPasswordQueuePayloadDTO(args[0].email, resetToken),
      );
      return result;
    };
    return descriptor;
  };
};
