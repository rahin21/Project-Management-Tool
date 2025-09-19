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
exports.TaskDependency = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const task_entity_1 = require("./task.entity");
let TaskDependency = class TaskDependency {
};
exports.TaskDependency = TaskDependency;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TaskDependency.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => task_entity_1.Task),
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (task) => task.dependencies, { eager: true }),
    __metadata("design:type", task_entity_1.Task)
], TaskDependency.prototype, "task", void 0);
__decorate([
    (0, graphql_1.Field)(() => task_entity_1.Task),
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, { eager: true }),
    __metadata("design:type", task_entity_1.Task)
], TaskDependency.prototype, "depends_on", void 0);
exports.TaskDependency = TaskDependency = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('task_dependencies')
], TaskDependency);
//# sourceMappingURL=task-dependency.entity.js.map