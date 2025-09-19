import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TaskDependency } from './task-dependency.entity';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
});

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

@ObjectType()
@Entity('tasks')
export class Task {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ type: 'varchar' })
  title!: string;

  @Field()
  @Column({ type: 'text' })
  description!: string;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.tasks, { eager: true })
  project!: Project;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: true, nullable: true })
  assignedTo?: User | null;

  @Field(() => TaskPriority)
  @Column({ type: 'varchar' })
  priority!: TaskPriority;

  @Field(() => TaskStatus)
  @Column({ type: 'varchar' })
  status!: TaskStatus;

  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  due_date?: string | null;

  @Field(() => [TaskDependency])
  @OneToMany(() => TaskDependency, (dep) => dep.task)
  dependencies!: TaskDependency[];

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}


