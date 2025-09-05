import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: process.env.RABBITMQ_QUEUE || 'analytics_queue',
      queueOptions: { durable: true },
      // noAck: false  // if you want manual ack; default auto ack is usually fine
    },
  });
  await app.listen();
  console.log('Analytics microservice listening (RMQ)');
}
bootstrap();
