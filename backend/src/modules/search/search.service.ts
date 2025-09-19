import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Task } from '../tasks/task.entity';
import { Project } from '../projects/project.entity';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexTask(task: Task) {
    return this.elasticsearchService.index({
      index: 'tasks',
      id: task.id,
      document: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.project?.id,
        projectName: task.project?.name,
      },
    });
  }

  async indexProject(project: Project) {
    return this.elasticsearchService.index({
      index: 'projects',
      id: project.id,
      document: {
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.owner?.id,
        ownerName: project.owner?.name,
      },
    });
  }

  async search(text: string) {
    const { hits } = await this.elasticsearchService.search({
      index: ['tasks', 'projects'],
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'description', 'name'],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    return hits.hits.map((item: any) => item._source);
  }

  async searchTasks(text: string) {
    const { hits } = await this.elasticsearchService.search({
      index: 'tasks',
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'description'],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    return hits.hits.map((item: any) => item._source);
  }

  async searchProjects(text: string) {
    const { hits } = await this.elasticsearchService.search({
      index: 'projects',
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['name', 'description'],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    return hits.hits.map((item: any) => item._source);
  }

  async removeTask(taskId: string) {
    try {
      await this.elasticsearchService.delete({
        index: 'tasks',
        id: taskId,
      });
    } catch (error) {
      // Document not found or already deleted
    }
  }

  async removeProject(projectId: string) {
    try {
      await this.elasticsearchService.delete({
        index: 'projects',
        id: projectId,
      });
    } catch (error) {
      // Document not found or already deleted
    }
  }
}