import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly repo: Repository<Notification>) {}

  create(user: User, message: string) {
    const n = this.repo.create({ user, message, read: false });
    return this.repo.save(n);
  }

  findByUserId(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }
    });
  }

  async markAsRead(id: string) {
    const notification = await this.repo.findOne({ where: { id } });
    if (notification) {
      notification.read = true;
      return this.repo.save(notification);
    }
    return null;
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.findByUserId(userId);
    for (const notification of notifications) {
      notification.read = true;
    }
    return this.repo.save(notifications);
  }
}


