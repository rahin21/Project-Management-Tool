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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
const projects_service_1 = require("../projects/projects.service");
const users_service_1 = require("../users/users.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TasksController = class TasksController {
    constructor(tasksService, projectsService, usersService) {
        this.tasksService = tasksService;
        this.projectsService = projectsService;
        this.usersService = usersService;
    }
    async findAll(req) {
        return this.tasksService.findByAssignedUser(req.user.userId);
    }
    async search(query, req) {
        const userTasks = await this.tasksService.findByAssignedUser(req.user.userId);
        const searchResults = await this.tasksService.search(query);
        const userTaskIds = userTasks.map(task => task.id);
        return searchResults.filter(task => userTaskIds.includes(task.id));
    }
    async create(createTaskDto) {
        const project = await this.projectsService.findOne(createTaskDto.projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        let assignedTo = null;
        if (createTaskDto.assignedToId) {
            assignedTo = await this.usersService.findOne(createTaskDto.assignedToId);
            if (!assignedTo) {
                throw new common_1.NotFoundException('Assigned user not found');
            }
        }
        const taskData = {
            title: createTaskDto.title,
            description: createTaskDto.description,
            project,
            assignedTo,
            priority: createTaskDto.priority,
            status: createTaskDto.status,
            due_date: createTaskDto.due_date,
            dependsOnIds: createTaskDto.dependsOnIds,
        };
        return this.tasksService.create(taskData);
    }
    async findOne(id, req) {
        const task = await this.tasksService.findOne(id);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (!task.assignedTo || task.assignedTo.id !== req.user.userId) {
            throw new common_1.HttpException('Access denied - task not assigned to you', common_1.HttpStatus.FORBIDDEN);
        }
        return task;
    }
    async update(id, updateTaskDto, req) {
        const task = await this.tasksService.findOne(id);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (!task.assignedTo || task.assignedTo.id !== req.user.userId) {
            throw new common_1.HttpException('Access denied - you can only update tasks assigned to you', common_1.HttpStatus.FORBIDDEN);
        }
        return this.tasksService.update(id, updateTaskDto);
    }
    async remove(id, req) {
        const task = await this.tasksService.findOne(id);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (!task.assignedTo || task.assignedTo.id !== req.user.userId) {
            throw new common_1.HttpException('Access denied - you can only delete tasks assigned to you', common_1.HttpStatus.FORBIDDEN);
        }
        return this.tasksService.remove(id);
    }
    topo(projectId) {
        return this.tasksService.topoSort(projectId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "search", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('topo/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "topo", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService,
        projects_service_1.ProjectsService,
        users_service_1.UsersService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map