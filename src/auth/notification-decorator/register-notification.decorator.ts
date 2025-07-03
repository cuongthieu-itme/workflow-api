import { Queue } from 'bullmq';
import { RegisterEmailQueuePayloadDTO } from 'src/queue/auth-queue-services/register-email-queue-processor.service';

export const RegisterNotification = () => {
  return (_: any, __: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
      const queue = this.registerEmailQueueService as Queue;
      const result = await originalMethod.apply(this, args);
      queue.add('send-email', new RegisterEmailQueuePayloadDTO(args[0].email));
      return result;
    };
    return descriptor;
  };
};
