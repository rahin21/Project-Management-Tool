import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Task, TaskStatus } from '../tasks/task.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getProjectStats() {
    const totalProjects = await this.projectsRepository.count();
    const activeProjects = await this.projectsRepository.createQueryBuilder('project')
      .innerJoin('project.tasks', 'task')
      .where('task.status != :status', { status: 'done' })
      .groupBy('project.id')
      .getCount();
    
    return {
      totalProjects,
      activeProjects,
      completedProjects: totalProjects - activeProjects,
    };
  }

  async getTaskStats() {
    const totalTasks = await this.tasksRepository.count();
    const todoTasks = await this.tasksRepository.count({ where: { status: TaskStatus.TODO } });
    const inProgressTasks = await this.tasksRepository.count({ where: { status: TaskStatus.IN_PROGRESS } });
    const doneTasks = await this.tasksRepository.count({ where: { status: TaskStatus.DONE } });
    
    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      completionRate: totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0,
    };
  }

  async getUserProductivity() {
    const users = await this.usersRepository.find({ relations: ['assignedTasks'] });
    
    return users.map(user => {
      const totalTasks = user.assignedTasks?.length || 0;
      const completedTasks = user.assignedTasks?.filter(task => task.status === 'done').length || 0;
      
      return {
        userId: user.id,
        name: user.name,
        totalAssignedTasks: totalTasks,
        completedTasks,
        productivityRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      };
    });
  }

  async getProjectProgress(projectId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['tasks'],
    });
    
    if (!project) {
      return null;
    }
    
    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter(task => task.status === 'done').length || 0;
    
    return {
      projectId: project.id,
      projectName: project.name,
      totalTasks,
      completedTasks,
      progressPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }

  async getTimeBasedAnalytics(startDate: Date, endDate: Date) {
    const tasksCreated = await this.tasksRepository.count({
      where: {
        created_at: Between(startDate, endDate),
      },
    });
    
    const tasksCompleted = await this.tasksRepository.count({
      where: {
        status: TaskStatus.DONE,
        updated_at: Between(startDate, endDate),
      },
    });
    
    const projectsCreated = await this.projectsRepository.count({
      where: {
        created_at: Between(startDate, endDate),
      },
    });
    
    return {
      period: {
        startDate,
        endDate,
      },
      tasksCreated,
      tasksCompleted,
      projectsCreated,
    };
  }
}