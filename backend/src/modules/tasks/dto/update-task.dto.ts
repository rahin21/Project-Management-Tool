import { IsString, IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority, TaskStatus } from '../task.entity';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTaskDto } from './create-task.dto';

@InputType()
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true })
  dependsOnIds?: string[];
}