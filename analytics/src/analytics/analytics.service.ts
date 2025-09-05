import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private users = new Map<string, any>(); // in-memory store

  async addUser(user: any) {
    const id = (Math.random()*1e6|0).toString();
    this.users.set(id, { id, ...user, createdAt: Date.now() });
  }

  getSummary(window?: 'all') {
    return {
      totalUsers: this.users.size,
      recent: Array.from(this.users.values()).slice(-5),
    };
  }
}
