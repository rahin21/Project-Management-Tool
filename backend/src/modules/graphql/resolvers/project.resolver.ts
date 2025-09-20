import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { ProjectsService } from '../../projects/projects.service';
import { Project } from '../../projects/project.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { User } from '../../users/user.entity';
import { CreateProjectInput } from '../inputs/create-project.input';
import { UpdateProjectInput } from '../inputs/update-project.input';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private projectsService: ProjectsService) {}

  @Query(() => [Project])
  @UseGuards(JwtAuthGuard)
  async projects() {
    return this.projectsService.findAll();
  }

  @Query(() => Project)
  @UseGuards(JwtAuthGuard)
  async project(@Args('id', { type: () => Int }) id: number) {
    return this.projectsService.findOne(id.toString());
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.create(input, user.id);
  }

  @Mutation(() => Project)
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProjectInput,
  ) {
    return this.projectsService.update(id.toString(), input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteProject(@Args('id', { type: () => Int }) id: number) {
    await this.projectsService.remove(id.toString());
    return true;
  }
}