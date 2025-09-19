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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
const task_dependency_entity_1 = require("./task-dependency.entity");
const search_service_1 = require("../search/search.service");
let TasksService = class TasksService {
    constructor(tasks, deps, searchService) {
        this.tasks = tasks;
        this.deps = deps;
        this.searchService = searchService;
    }
    findAll() {
        return this.tasks.find({
            relations: ['project', 'assignedTo']
        });
    }
    findByAssignedUser(userId) {
        return this.tasks.find({
            where: { assignedTo: { id: userId } },
            relations: ['project', 'assignedTo']
        });
    }
    async findOne(id) {
        return this.tasks.findOne({
            where: { id },
            relations: ['project', 'assignedTo'],
        });
    }
    async create(data) {
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
        await this.searchService.indexTask(savedTask);
        return savedTask;
    }
    async update(id, updateData) {
        await this.tasks.update(id, updateData);
        const updatedTask = await this.findOne(id);
        if (!updatedTask) {
            throw new Error('Task not found after update');
        }
        await this.searchService.indexTask(updatedTask);
        return updatedTask;
    }
    async remove(id) {
        await this.tasks.delete(id);
        await this.searchService.removeTask(id);
    }
    async search(query) {
        return this.searchService.searchTasks(query);
    }
    async addDependencies(taskId, parentIds) {
        const task = await this.tasks.findOneOrFail({ where: { id: taskId } });
        const parents = await this.tasks.find({ where: { id: (0, typeorm_2.In)(parentIds) } });
        const depEntities = parents.map((p) => this.deps.create({ task, depends_on: p }));
        await this.deps.save(depEntities);
        return this.getDependencies(taskId);
    }
    getDependencies(taskId) {
        return this.deps.find({ where: { task: { id: taskId } } });
    }
    async topoSort(projectId) {
        const tasks = await this.tasks.find({ where: { project: { id: projectId } } });
        const deps = await this.deps.find();
        const inDegree = new Map();
        const graph = new Map();
        tasks.forEach((t) => {
            inDegree.set(t.id, 0);
            graph.set(t.id, []);
        });
        deps.forEach((d) => {
            if (!graph.has(d.depends_on.id))
                graph.set(d.depends_on.id, []);
            graph.get(d.depends_on.id).push(d.task.id);
            inDegree.set(d.task.id, (inDegree.get(d.task.id) || 0) + 1);
        });
        const queue = [];
        inDegree.forEach((deg, id) => {
            if (deg === 0)
                queue.push(id);
        });
        const order = [];
        while (queue.length) {
            const id = queue.shift();
            order.push(id);
            for (const next of graph.get(id) || []) {
                inDegree.set(next, (inDegree.get(next) || 0) - 1);
                if ((inDegree.get(next) || 0) === 0)
                    queue.push(next);
            }
        }
        if (order.length !== tasks.length)
            throw new Error('Cycle detected');
        return order.map((id) => tasks.find((t) => t.id === id));
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(task_dependency_entity_1.TaskDependency)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        search_service_1.SearchService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map