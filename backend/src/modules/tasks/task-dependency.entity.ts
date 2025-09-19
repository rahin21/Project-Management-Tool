import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Task } from './task.entity';

@ObjectType()
@Entity('task_dependencies')
export class TaskDependency {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => Task)
  @ManyToOne(() => Task, (task) => task.dependencies, { eager: true })
  task!: Task; // child task

  @Field(() => Task)
  @ManyToOne(() => Task, { eager: true })
  depends_on!: Task; // parent task
}


