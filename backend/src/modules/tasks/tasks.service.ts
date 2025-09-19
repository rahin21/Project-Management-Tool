import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task, TaskPriority, TaskStatus } from './task.entity';
import { TaskDependency } from './task-dependency.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { SearchService } from '../search/search.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(TaskDependency) private readonly deps: Repository<TaskDependency>,
    private searchService: SearchService,
  ) {}
  
  findAll() {
    return this.tasks.find({
      relations: ['project', 'assignedTo']
    });
  }

  async findOne(id: string) {
    return this.tasks.findOne({
      where: { id },
      relations: ['project', 'assignedTo'],
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
    
    return savedTask;
  }

  async update(id: string, updateData: Partial<Task>) {
    await this.tasks.update(id, updateData);
    const updatedTask = await this.findOne(id);
    
    if (!updatedTask) {
      throw new Error('Task not found after update');
    }
    
    // Update the task in Elasticsearch
    await this.searchService.indexTask(updatedTask);
    
    return updatedTask;
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


