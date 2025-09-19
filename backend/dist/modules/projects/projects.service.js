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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./project.entity");
const cache_service_1 = require("../cache/cache.service");
const search_service_1 = require("../search/search.service");
let ProjectsService = class ProjectsService {
    constructor(projectsRepository, cacheService, searchService) {
        this.projectsRepository = projectsRepository;
        this.cacheService = cacheService;
        this.searchService = searchService;
    }
    async findAll() {
        const cacheKey = 'projects:all';
        const cachedProjects = await this.cacheService.get(cacheKey);
        if (cachedProjects) {
            return cachedProjects;
        }
        const projects = await this.projectsRepository.find({ relations: ['tasks', 'owner'] });
        await this.cacheService.set(cacheKey, projects, 300);
        return projects;
    }
    async findOne(id) {
        const cacheKey = `project:${id}`;
        const cachedProject = await this.cacheService.get(cacheKey);
        if (cachedProject) {
            return cachedProject;
        }
        const project = await this.projectsRepository.findOne({
            where: { id },
            relations: ['tasks', 'owner']
        });
        if (project) {
            await this.cacheService.set(cacheKey, project, 300);
        }
        return project;
    }
    async create(createProjectDto, userId) {
        const project = this.projectsRepository.create({
            ...createProjectDto,
            owner: { id: userId },
        });
        const savedProject = await this.projectsRepository.save(project);
        await this.cacheService.del('projects:all');
        await this.searchService.indexProject(savedProject);
        return savedProject;
    }
    async update(id, updateProjectDto) {
        await this.projectsRepository.update(id, updateProjectDto);
        await this.cacheService.del(`project:${id}`);
        await this.cacheService.del('projects:all');
        const updatedProject = await this.findOne(id);
        if (!updatedProject) {
            throw new Error('Project not found after update');
        }
        await this.searchService.indexProject(updatedProject);
        return updatedProject;
    }
    async remove(id) {
        await this.projectsRepository.delete(id);
        await this.cacheService.del(`project:${id}`);
        await this.cacheService.del('projects:all');
        await this.searchService.removeProject(id);
    }
    async search(query) {
        return this.searchService.searchProjects(query);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cache_service_1.CacheService,
        search_service_1.SearchService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map