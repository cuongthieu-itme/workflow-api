import { Module } from '@nestjs/common';
import { LoginEmailQueueProcessorService } from './auth-queue-services/login-email-queue-processor.service';
import { UserModule } from 'src/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RegisterEmailQueueProcessorService } from './auth-queue-services/register-email-queue-processor.service';
import { ForgetPasswordEmailQueueProcessorService } from './auth-queue-services/forget-password-email-queue-processor.service';
import { VerifyAccountEmailQueueProcessorService } from './auth-queue-services/verify-account-email-queue-processor.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    UserModule,
  ],
  providers: [
    LoginEmailQueueProcessorService,
    RegisterEmailQueueProcessorService,
    ForgetPasswordEmailQueueProcessorService,
    VerifyAccountEmailQueueProcessorService,
  ],
})
export class QueueModule {}
