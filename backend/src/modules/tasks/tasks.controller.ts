import { Body, Controller, Get, Param, Post, Query, Delete, Patch, UseGuards, NotFoundException, Request, HttpException, HttpStatus } from '@nestjs/common';
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
  async findAll(@Request() req: any) {
    // Only return tasks assigned to the current user
    return this.tasksService.findByAssignedUser(req.user.userId);
  }

  @Get('search')
  async search(@Query('query') query: string, @Request() req: any) {
    // Get all tasks assigned to the user first
    const userTasks = await this.tasksService.findByAssignedUser(req.user.userId);
    
    // Filter the search results to only include user's tasks
    const searchResults = await this.tasksService.search(query);
    const userTaskIds = userTasks.map(task => task.id);
    
    return searchResults.filter(task => userTaskIds.includes(task.id));
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
  async findOne(@Param('id') id: string, @Request() req: any) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // Only allow access if user is assigned to the task
    if (!task.assignedTo || task.assignedTo.id !== req.user.userId) {
      throw new HttpException('Access denied - task not assigned to you', HttpStatus.FORBIDDEN);
    }
    
    return task;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // Only allow updates if user is assigned to the task
    if (!task.assignedTo || task.assignedTo.id !== req.user.userId) {
      throw new HttpException('Access denied - you can only update tasks assigned to you', HttpStatus.FORBIDDEN);
    }
    
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // Only allow deletion if user is assigned to the task
    if (!task.assignedTo || task.assignedTo.id !== req.user.userId) {
      throw new HttpException('Access denied - you can only delete tasks assigned to you', HttpStatus.FORBIDDEN);
    }
    
    return this.tasksService.remove(id);
  }

  @Get('topo/:projectId')
  topo(@Param('projectId') projectId: string) {
    return this.tasksService.topoSort(projectId);
  }
}


