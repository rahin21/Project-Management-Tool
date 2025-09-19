import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CacheService } from '../cache/cache.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private cacheService: CacheService,
    private searchService: SearchService,
  ) {}

  async findAll(): Promise<Project[]> {
    const cacheKey = 'projects:all';
    const cachedProjects = await this.cacheService.get<Project[]>(cacheKey);
    
    if (cachedProjects) {
      return cachedProjects;
    }
    
    const projects = await this.projectsRepository.find({ relations: ['tasks', 'owner'] });
    await this.cacheService.set(cacheKey, projects, 300); // Cache for 5 minutes
    return projects;
  }

  async findByUser(userId: string): Promise<Project[]> {
    const cacheKey = `projects:user:${userId}`;
    const cachedProjects = await this.cacheService.get<Project[]>(cacheKey);
    
    if (cachedProjects) {
      return cachedProjects;
    }
    
    // Find projects where user is owner OR assigned to tasks in the project
    const projects = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.tasks', 'tasks')
      .leftJoinAndSelect('tasks.assignedTo', 'assignedTo')
      .where('project.owner.id = :userId', { userId })
      .orWhere('tasks.assignedTo.id = :userId', { userId })
      .getMany();
    
    await this.cacheService.set(cacheKey, projects, 300); // Cache for 5 minutes
    return projects;
  }

  async findOne(id: string): Promise<Project | null> {
    const cacheKey = `project:${id}`;
    const cachedProject = await this.cacheService.get<Project>(cacheKey);
    
    if (cachedProject) {
      return cachedProject;
    }
    
    const project = await this.projectsRepository.findOne({ 
      where: { id },
      relations: ['tasks', 'owner']
    });
    
    if (project) {
      await this.cacheService.set(cacheKey, project, 300); // Cache for 5 minutes
    }
    
    return project;
  }

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      owner: { id: userId },
    });
    const savedProject = await this.projectsRepository.save(project);
    
    // Invalidate cache
    await this.cacheService.del('projects:all');
    
    // Index in Elasticsearch
    await this.searchService.indexProject(savedProject as Project);
    
    return savedProject as Project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.projectsRepository.update(id, updateProjectDto);
    
    // Invalidate cache
    await this.cacheService.del(`project:${id}`);
    await this.cacheService.del('projects:all');
    
    const updatedProject = await this.findOne(id);
    if (!updatedProject) {
      throw new Error('Project not found after update');
    }
    
    // Update in Elasticsearch
    await this.searchService.indexProject(updatedProject);
    
    return updatedProject;
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
    
    // Invalidate cache
    await this.cacheService.del(`project:${id}`);
    await this.cacheService.del('projects:all');
    
    // Remove from Elasticsearch
    await this.searchService.removeProject(id);
  }
  
  async search(query: string): Promise<any[]> {
    return this.searchService.searchProjects(query);
  }
}


