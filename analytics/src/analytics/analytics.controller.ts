import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload, Ctx, RmqContext, RpcException } from '@nestjs/microservices';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { of } from 'rxjs';
import { ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  // event: fire-and-forget
  @EventPattern('user.created')
  async handleUserCreated(
    @Payload(new ValidationPipe({ whitelist: true })) payload: CreateUserDto,
    @Ctx() ctx: RmqContext,
  ) {
    try {
      console.log('Analytics: received user.created', payload);
      await this.svc.addUser(payload);
      console.log('Analytics: user stored');
    } catch (err) {
      // convert to RpcException so callers see an error if they used RPC; for event we usually log+continue
      console.error('Analytics: failed to process user.created', err?.message || err);
      throw new RpcException('Failed to process user.created');
    }
  }

  // RPC: request-response
  @MessagePattern('user.summary')
  getSummary(@Payload() payload: any) {
    return this.svc.getSummary(payload?.window);
  }
}
