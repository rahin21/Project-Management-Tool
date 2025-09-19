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
exports.TaskResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const tasks_service_1 = require("../../tasks/tasks.service");
const task_entity_1 = require("../../tasks/task.entity");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const create_task_dto_1 = require("../../tasks/dto/create-task.dto");
const update_task_dto_1 = require("../../tasks/dto/update-task.dto");
const projects_service_1 = require("../../projects/projects.service");
const users_service_1 = require("../../users/users.service");
let TaskResolver = class TaskResolver {
    constructor(tasksService, projectsService, usersService) {
        this.tasksService = tasksService;
        this.projectsService = projectsService;
        this.usersService = usersService;
    }
    async tasks(req) {
        return this.tasksService.findByAssignedUserOrProjectOwner(req.user.userId);
    }
    async task(id, req) {
        const task = await this.tasksService.findOne(id.toString());
        if (!task) {
            throw new Error('Task not found');
        }
        const hasAccess = (task.assignedTo && task.assignedTo.id === req.user.userId) ||
            (task.project.owner && task.project.owner.id === req.user.userId);
        if (!hasAccess) {
            throw new Error('Access denied - you can only view tasks assigned to you or in your projects');
        }
        return task;
    }
    async createTask(input) {
        const project = await this.projectsService.findOne(input.projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        let assignedTo = null;
        if (input.assignedToId) {
            assignedTo = await this.usersService.findOne(input.assignedToId);
        }
        return this.tasksService.create({
            title: input.title,
            description: input.description,
            project: project,
            assignedTo: assignedTo,
            priority: input.priority,
            status: input.status,
            due_date: input.due_date,
            dependsOnIds: input.dependsOnIds,
        });
    }
    async updateTask(id, input, req) {
        const task = await this.tasksService.findOne(id.toString());
        if (!task) {
            throw new Error('Task not found');
        }
        const hasAccess = (task.assignedTo && task.assignedTo.id === req.user.userId) ||
            (task.project.owner && task.project.owner.id === req.user.userId);
        if (!hasAccess) {
            throw new Error('Access denied - you can only update tasks assigned to you or in your projects');
        }
        return this.tasksService.update(id.toString(), input);
    }
    async deleteTask(id, req) {
        const task = await this.tasksService.findOne(id.toString());
        if (!task) {
            throw new Error('Task not found');
        }
        const hasAccess = (task.assignedTo && task.assignedTo.id === req.user.userId) ||
            (task.project.owner && task.project.owner.id === req.user.userId);
        if (!hasAccess) {
            throw new Error('Access denied - you can only delete tasks assigned to you or in your projects');
        }
        await this.tasksService.remove(id.toString());
        return true;
    }
};
exports.TaskResolver = TaskResolver;
__decorate([
    (0, graphql_1.Query)(() => [task_entity_1.Task]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "tasks", null);
__decorate([
    (0, graphql_1.Query)(() => task_entity_1.Task),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.Int })),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "task", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_entity_1.Task),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "createTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_entity_1.Task),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.Int })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "updateTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.Int })),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TaskResolver.prototype, "deleteTask", null);
exports.TaskResolver = TaskResolver = __decorate([
    (0, graphql_1.Resolver)(() => task_entity_1.Task),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        projects_service_1.ProjectsService,
        users_service_1.UsersService])
], TaskResolver);
//# sourceMappingURL=task.resolver.js.map