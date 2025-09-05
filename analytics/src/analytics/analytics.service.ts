import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Activity } from '../entities/activity.entity';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) {}

  async addUser(user: { name: string; email: string; metadata?: string }) {
    return await this.dataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);
      const activityRepository = manager.getRepository(Activity);

      // Idempotent insert by unique email; if exists, do nothing
      const insertResult = await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          name: user.name,
          email: user.email,
          metadata: user.metadata ?? null,
        })
        .onConflict('("email") DO NOTHING')
        .returning('*')
        .execute();

      let savedUser: User;
      const wasInserted = insertResult.raw && insertResult.raw.length > 0;
      if (wasInserted) {
        savedUser = insertResult.raw[0] as User;
        const activity = activityRepository.create({
          user: savedUser,
          action: 'created',
        });
        await activityRepository.save(activity);
      } else {
        // Already exists — fetch existing user; skip duplicate 'created' activity
        savedUser = await userRepository.findOneOrFail({ where: { email: user.email } });
      }

      return savedUser;
    });
  }

  async getSummary(window?: 'all') {
    const totalUsers = await this.userRepo.count();
    const recent = await this.userRepo
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC')
      .limit(5)
      .getMany();

    const activityCounts = await this.activityRepo
      .createQueryBuilder('activity')
      .select('activity.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('activity.action')
      .getRawMany();

    return { totalUsers, recent, activityCounts };
  }
}
