import { Queue } from 'bullmq';
import { VerifyAccountEmailQueuePayloadDTO } from 'src/queue/auth-queue-services/verify-account-email-queue-processor.service';

export const VerifyAccountNotification = () => {
  return (_: any, __: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
      const queue = this.verifyAccountEmailQueueService as Queue;
      const result = await originalMethod.apply(this, args);
      
      const user = await this.userService.findUserById(args[0].id);
      queue.add(
        'send-email',
        new VerifyAccountEmailQueuePayloadDTO(user.email),
      );
      return result;
    };
    return descriptor;
  };
};
