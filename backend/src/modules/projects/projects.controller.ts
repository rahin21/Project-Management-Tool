import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findByUser(req.user.userId);
  }

  @Get('search')
  search(@Query('query') query: string) {
    return this.projectsService.search(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    try {
      const project = await this.projectsService.findOne(id);
      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }
      
      // Check if user has access to this project (owner or assigned to tasks)
      const hasAccess = project.owner.id === req.user.userId || 
                       project.tasks.some(task => task.assignedTo?.id === req.user.userId);
      
      if (!hasAccess) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }
      
      return project;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req: any) {
    try {
      const project = await this.projectsService.findOne(id);
      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }
      
      // Only project owner can update
      if (project.owner.id !== req.user.userId) {
        throw new HttpException('Only project owner can update the project', HttpStatus.FORBIDDEN);
      }
      
      return this.projectsService.update(id, updateProjectDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      const project = await this.projectsService.findOne(id);
      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }
      
      // Only project owner can delete
      if (project.owner.id !== req.user.userId) {
        throw new HttpException('Only project owner can delete the project', HttpStatus.FORBIDDEN);
      }
      
      await this.projectsService.remove(id);
      return { message: 'Project deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


