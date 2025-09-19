import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';

@ObjectType()
@Entity('projects')
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ type: 'varchar' })
  name!: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ownedProjects, { eager: true })
  owner!: User;

  @Field(() => [Task])
  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}


