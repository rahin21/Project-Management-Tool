import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Notification } from '../../notifications/notification.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { User } from '../../users/user.entity';

@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [Notification])
  async notifications(@CurrentUser() user: User): Promise<Notification[]> {
    return this.notificationsService.findByUserId(user.id);
  }

  @Mutation(() => Notification, { nullable: true })
  async markNotificationAsRead(@Args('id') id: string): Promise<Notification | null> {
    return this.notificationsService.markAsRead(id);
  }

  @Mutation(() => [Notification])
  async markAllNotificationsAsRead(@CurrentUser() user: User): Promise<Notification[]> {
    return this.notificationsService.markAllAsRead(user.id);
  }
}