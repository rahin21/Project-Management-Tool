import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';

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

  @Field()
  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}


