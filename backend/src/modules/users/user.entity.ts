import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { Notification } from '../notifications/notification.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ type: 'varchar' })
  name!: string;

  @Field()
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Field(() => UserRole)
  @Column({ type: 'varchar' })
  role!: UserRole;

  @Field(() => [Project])
  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects!: Project[];

  @Field(() => [Task])
  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks!: Task[];

  @Field(() => [Notification])
  @OneToMany(() => Notification, (n) => n.user)
  notifications!: Notification[];

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}


