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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const task_entity_1 = require("../tasks/task.entity");
const user_entity_1 = require("../users/user.entity");
let AnalyticsService = class AnalyticsService {
    constructor(projectsRepository, tasksRepository, usersRepository) {
        this.projectsRepository = projectsRepository;
        this.tasksRepository = tasksRepository;
        this.usersRepository = usersRepository;
    }
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
        const todoTasks = await this.tasksRepository.count({ where: { status: task_entity_1.TaskStatus.TODO } });
        const inProgressTasks = await this.tasksRepository.count({ where: { status: task_entity_1.TaskStatus.IN_PROGRESS } });
        const doneTasks = await this.tasksRepository.count({ where: { status: task_entity_1.TaskStatus.DONE } });
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
    async getProjectProgress(projectId) {
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
    async getTimeBasedAnalytics(startDate, endDate) {
        const tasksCreated = await this.tasksRepository.count({
            where: {
                created_at: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const tasksCompleted = await this.tasksRepository.count({
            where: {
                status: task_entity_1.TaskStatus.DONE,
                updated_at: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const projectsCreated = await this.projectsRepository.count({
            where: {
                created_at: (0, typeorm_2.Between)(startDate, endDate),
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map