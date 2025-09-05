import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { lastValueFrom, timeout, retry } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(@Inject('ANALYTICS_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // Emit event (fire-and-forget)
    console.log('Producer: emitting user.created', dto);
    this.client.emit('user.created', dto);

    // Now request a summary (RPC) — with timeout & retry
    const request$ = this.client.send('user.summary', { window: 'all' }).pipe(
      timeout(4000), // 4s timeout per attempt
      retry({ count: 2, delay: 1000 }), // retry 2 times with 1s delay
    );

    try {
      // convert Observable -> Promise to await it in controller
      const summary = await lastValueFrom(request$);
      console.log('Producer: summary received', summary);
      return { ok: true, summary };
    } catch (err) {
      // rpc errors from microservice show up here; map to HTTP
      console.error('Producer: analytics RPC failed', err?.message || err);
      throw new HttpException('Analytics unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
