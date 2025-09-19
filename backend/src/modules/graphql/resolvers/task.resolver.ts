import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { TasksService } from '../../tasks/tasks.service';
import { Task } from '../../tasks/task.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from '../../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../tasks/dto/update-task.dto';
import { ProjectsService } from '../../projects/projects.service';
import { UsersService } from '../../users/users.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private usersService: UsersService,
  ) {}

  @Query(() => [Task])
  @UseGuards(JwtAuthGuard)
  async tasks() {
    return this.tasksService.findAll();
  }

  @Query(() => Task)
  @UseGuards(JwtAuthGuard)
  async task(@Args('id', { type: () => Int }) id: number) {
    return this.tasksService.findOne(id.toString());
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async createTask(@Args('input') input: CreateTaskDto) {
    // Get the project first
    const project = await this.projectsService.findOne(input.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get assigned user if provided
    let assignedTo = null;
    if (input.assignedToId) {
      assignedTo = await this.usersService.findOne(input.assignedToId);
    }

    return this.tasksService.create({
      title: input.title,
      description: input.description,
      project: project,
      assignedTo: assignedTo,
      priority: input.priority,
      status: input.status,
      due_date: input.due_date,
      dependsOnIds: input.dependsOnIds,
    });
  }

  @Mutation(() => Task)
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateTaskDto,
  ) {
    return this.tasksService.update(id.toString(), input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteTask(@Args('id', { type: () => Int }) id: number) {
    await this.tasksService.remove(id.toString());
    return true;
  }
}