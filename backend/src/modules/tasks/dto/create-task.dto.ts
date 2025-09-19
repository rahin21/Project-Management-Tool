import { IsString, IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority, TaskStatus } from '../task.entity';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTaskDto {
  @Field()
  @IsString()
  title!: string;

  @Field()
  @IsString()
  description!: string;

  @Field()
  @IsUUID()
  projectId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field()
  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @Field()
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true })
  dependsOnIds?: string[];
}