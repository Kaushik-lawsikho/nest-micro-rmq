import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { Tag } from '../entities/tag.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Activity, Tag])],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}
