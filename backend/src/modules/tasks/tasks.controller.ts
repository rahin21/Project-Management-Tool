import { Body, Controller, Get, Param, Post, Query, Delete, Patch, UseGuards, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('search')
  search(@Query('query') query: string) {
    return this.tasksService.search(query);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    // Find the project by ID
    const project = await this.projectsService.findOne(createTaskDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Find the assigned user if provided
    let assignedTo: User | null = null;
    if (createTaskDto.assignedToId) {
      assignedTo = await this.usersService.findOne(createTaskDto.assignedToId);
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    // Create the task data object
    const taskData = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      project,
      assignedTo,
      priority: createTaskDto.priority,
      status: createTaskDto.status,
      due_date: createTaskDto.due_date,
      dependsOnIds: createTaskDto.dependsOnIds,
    };

    return this.tasksService.create(taskData);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Get('topo/:projectId')
  topo(@Param('projectId') projectId: string) {
    return this.tasksService.topoSort(projectId);
  }
}


