import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task, TaskPriority, TaskStatus } from './task.entity';
import { TaskDependency } from './task-dependency.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(TaskDependency) private readonly deps: Repository<TaskDependency>,
    private searchService: SearchService,
    private notificationsService: NotificationsService,
  ) {}
  
  findAll() {
    return this.tasks.find({
      relations: ['project', 'assignedTo']
    });
  }

  findByAssignedUserOrProjectOwner(userId: string) {
    return this.tasks.find({
      where: [
        { assignedTo: { id: userId } }, // Tasks assigned to the user
        { project: { owner: { id: userId } } } // Tasks in projects owned by the user
      ],
      relations: ['project', 'project.owner', 'assignedTo']
    });
  }

  async findOne(id: string) {
    return this.tasks.findOne({
      where: { id },
      relations: ['project', 'project.owner', 'assignedTo'],
    });
  }

  async create(data: {
    title: string;
    description: string;
    project: Project;
    assignedTo?: User | null;
    priority: TaskPriority;
    status: TaskStatus;
    due_date?: string | null;
    dependsOnIds?: string[];
  }) {
    const task = this.tasks.create({
      title: data.title,
      description: data.description,
      project: data.project,
      assignedTo: data.assignedTo ?? null,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date ?? null,
    });
    const savedTask = await this.tasks.save(task);
    
    // Index the task in Elasticsearch
    await this.searchService.indexTask(savedTask);
    
    // Send notification to assigned user if task is assigned
    if (savedTask.assignedTo) {
      await this.notificationsService.createTaskNotification(
        savedTask.assignedTo,
        savedTask.title,
        NotificationType.TASK_ASSIGNED,
        savedTask.id
      );
    }
    
    return savedTask;
  }

  async update(id: string, updateData: any) {
    try {
      // Get the existing task first
      const existingTask = await this.findOne(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }
      
      // Transform the DTO data to match entity structure
      const transformedData: any = { ...updateData };
      
      // Handle assignedToId -> assignedTo relationship
      if (updateData.assignedToId !== undefined) {
        if (updateData.assignedToId) {
          transformedData.assignedTo = { id: updateData.assignedToId };
        } else {
          transformedData.assignedTo = null;
        }
        delete transformedData.assignedToId;
      }
      
      // Handle projectId -> project relationship
      if (updateData.projectId) {
        transformedData.project = { id: updateData.projectId };
        delete transformedData.projectId;
      }
      
      await this.tasks.update(id, transformedData);
      const updatedTask = await this.findOne(id);
      
      if (!updatedTask) {
        throw new Error('Task not found after update');
      }
      
      // Update the task in Elasticsearch
      try {
        await this.searchService.indexTask(updatedTask);
      } catch (searchError) {
        // Log search error but don't fail the update
        console.error('Failed to index task in Elasticsearch:', searchError);
      }
      
      // Send notifications for task updates
      // Notify if task was assigned to a new user
      if (updateData.assignedToId && existingTask.assignedTo?.id !== updateData.assignedToId) {
        if (updatedTask.assignedTo) {
          await this.notificationsService.createTaskNotification(
            updatedTask.assignedTo,
            updatedTask.title,
            NotificationType.TASK_ASSIGNED,
            updatedTask.id
          );
        }
      }
      
      // Notify if task status changed to completed
      if (updateData.status === TaskStatus.DONE && existingTask.status !== TaskStatus.DONE) {
        if (updatedTask.assignedTo) {
          await this.notificationsService.createTaskNotification(
            updatedTask.assignedTo,
            updatedTask.title,
            NotificationType.TASK_COMPLETED,
            updatedTask.id
          );
        }
        // Also notify project owner
        if (updatedTask.project?.owner && updatedTask.project.owner.id !== updatedTask.assignedTo?.id) {
          await this.notificationsService.createTaskNotification(
            updatedTask.project.owner,
            updatedTask.title,
            NotificationType.TASK_COMPLETED,
            updatedTask.id
          );
        }
      }
      
      // General task update notification (only if not already notified above)
      if (!updateData.assignedToId && updateData.status !== TaskStatus.DONE) {
        if (updatedTask.assignedTo) {
          await this.notificationsService.createTaskNotification(
            updatedTask.assignedTo,
            updatedTask.title,
            NotificationType.TASK_UPDATED,
            updatedTask.id
          );
        }
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.tasks.delete(id);
    
    // Remove the task from Elasticsearch
    await this.searchService.removeTask(id);
  }

  async search(query: string) {
    return this.searchService.searchTasks(query);
  }

  async addDependencies(taskId: string, parentIds: string[]) {
    const task = await this.tasks.findOneOrFail({ where: { id: taskId } });
    const parents = await this.tasks.find({ where: { id: In(parentIds) } });
    const depEntities = parents.map((p) => this.deps.create({ task, depends_on: p }));
    await this.deps.save(depEntities);
    return this.getDependencies(taskId);
  }

  getDependencies(taskId: string) {
    return this.deps.find({ where: { task: { id: taskId } } });
  }

  // Kahn's algorithm for topological sort
  async topoSort(projectId: string) {
    const tasks = await this.tasks.find({ where: { project: { id: projectId } } });
    const deps = await this.deps.find();
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    tasks.forEach((t) => {
      inDegree.set(t.id, 0);
      graph.set(t.id, []);
    });
    deps.forEach((d) => {
      if (!graph.has(d.depends_on.id)) graph.set(d.depends_on.id, []);
      graph.get(d.depends_on.id)!.push(d.task.id);
      inDegree.set(d.task.id, (inDegree.get(d.task.id) || 0) + 1);
    });
    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });
    const order: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      order.push(id);
      for (const next of graph.get(id) || []) {
        inDegree.set(next, (inDegree.get(next) || 0) - 1);
        if ((inDegree.get(next) || 0) === 0) queue.push(next);
      }
    }
    if (order.length !== tasks.length) throw new Error('Cycle detected');
    return order.map((id) => tasks.find((t) => t.id === id)!);
  }
}


