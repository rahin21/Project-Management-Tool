import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class UpdateProjectInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}