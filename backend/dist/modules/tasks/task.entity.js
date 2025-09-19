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
exports.Task = exports.TaskStatus = exports.TaskPriority = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const task_dependency_entity_1 = require("./task-dependency.entity");
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["DONE"] = "done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
(0, graphql_1.registerEnumType)(TaskPriority, {
    name: 'TaskPriority',
});
(0, graphql_1.registerEnumType)(TaskStatus, {
    name: 'TaskStatus',
});
let Task = class Task {
};
exports.Task = Task;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Task.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => project_entity_1.Project),
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (project) => project.tasks, { eager: true }),
    __metadata("design:type", project_entity_1.Project)
], Task.prototype, "project", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.assignedTasks, { eager: true, nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "assignedTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => TaskPriority),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => TaskStatus),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Task.prototype, "due_date", void 0);
__decorate([
    (0, graphql_1.Field)(() => [task_dependency_entity_1.TaskDependency]),
    (0, typeorm_1.OneToMany)(() => task_dependency_entity_1.TaskDependency, (dep) => dep.task),
    __metadata("design:type", Array)
], Task.prototype, "dependencies", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Task.prototype, "created_at", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Task.prototype, "updated_at", void 0);
exports.Task = Task = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('tasks')
], Task);
//# sourceMappingURL=task.entity.js.map