import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { User } from '../users/user.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    user: User, 
    message: string, 
    type: NotificationType = NotificationType.GENERAL,
    entityId?: string,
    entityType?: string
  ) {
    const notification = this.repo.create({ 
      user, 
      message, 
      type,
      entityId,
      entityType,
      read: false 
    });
    const savedNotification = await this.repo.save(notification);
    
    // Emit notification to user via WebSocket
    this.notificationsGateway.emitToUser(user.id, 'notification', savedNotification);
    
    return savedNotification;
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

  // Helper methods for creating specific notification types
  async createProjectNotification(user: User, projectName: string, type: NotificationType, projectId: string) {
    let message = '';
    switch (type) {
      case NotificationType.PROJECT_CREATED:
        message = `New project "${projectName}" has been created`;
        break;
      case NotificationType.PROJECT_UPDATED:
        message = `Project "${projectName}" has been updated`;
        break;
      case NotificationType.PROJECT_DELETED:
        message = `Project "${projectName}" has been deleted`;
        break;
      case NotificationType.PROJECT_MEMBER_ADDED:
        message = `You have been added to project "${projectName}"`;
        break;
      case NotificationType.PROJECT_MEMBER_REMOVED:
        message = `You have been removed from project "${projectName}"`;
        break;
      default:
        message = `Project "${projectName}" notification`;
    }
    
    return this.create(user, message, type, projectId, 'project');
  }

  async createTaskNotification(user: User, taskTitle: string, type: NotificationType, taskId: string) {
    let message = '';
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        message = `You have been assigned to task "${taskTitle}"`;
        break;
      case NotificationType.TASK_UPDATED:
        message = `Task "${taskTitle}" has been updated`;
        break;
      case NotificationType.TASK_COMPLETED:
        message = `Task "${taskTitle}" has been completed`;
        break;
      case NotificationType.TASK_DUE_SOON:
        message = `Task "${taskTitle}" is due soon`;
        break;
      case NotificationType.TASK_OVERDUE:
        message = `Task "${taskTitle}" is overdue`;
        break;
      default:
        message = `Task "${taskTitle}" notification`;
    }
    
    return this.create(user, message, type, taskId, 'task');
  }
}


