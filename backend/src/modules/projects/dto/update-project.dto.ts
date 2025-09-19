import { IsString, IsOptional } from 'class-validator';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProjectDto } from './create-project.dto';

@InputType()
export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}