"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
let SearchService = class SearchService {
    constructor(elasticsearchService) {
        this.elasticsearchService = elasticsearchService;
    }
    async indexTask(task) {
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
    async indexProject(project) {
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
    async search(text) {
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
        return hits.hits.map((item) => item._source);
    }
    async searchTasks(text) {
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
        return hits.hits.map((item) => item._source);
    }
    async searchProjects(text) {
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
        return hits.hits.map((item) => item._source);
    }
    async removeTask(taskId) {
        try {
            await this.elasticsearchService.delete({
                index: 'tasks',
                id: taskId,
            });
        }
        catch (error) {
        }
    }
    async removeProject(projectId) {
        try {
            await this.elasticsearchService.delete({
                index: 'projects',
                id: projectId,
            });
        }
        catch (error) {
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService])
], SearchService);
//# sourceMappingURL=search.service.js.map