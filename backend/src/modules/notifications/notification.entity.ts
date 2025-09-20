import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../users/user.entity';

export enum NotificationType {
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  PROJECT_MEMBER_ADDED = 'project_member_added',
  PROJECT_MEMBER_REMOVED = 'project_member_removed',
  GENERAL = 'general'
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  user!: User;

  @Field()
  @Column({ type: 'text' })
  message!: string;

  @Field(() => NotificationType)
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL
  })
  type!: NotificationType;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  entityId?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  entityType?: string;

  @Field()
  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}


