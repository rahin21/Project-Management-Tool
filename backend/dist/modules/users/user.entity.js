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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const project_entity_1 = require("../projects/project.entity");
const task_entity_1 = require("../tasks/task.entity");
const notification_entity_1 = require("../notifications/notification.entity");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["MEMBER"] = "member";
})(UserRole || (exports.UserRole = UserRole = {}));
(0, graphql_1.registerEnumType)(UserRole, {
    name: 'UserRole',
});
let User = class User {
};
exports.User = User;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)(() => UserRole),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => [project_entity_1.Project]),
    (0, typeorm_1.OneToMany)(() => project_entity_1.Project, (project) => project.owner),
    __metadata("design:type", Array)
], User.prototype, "ownedProjects", void 0);
__decorate([
    (0, graphql_1.Field)(() => [task_entity_1.Task]),
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.assignedTo),
    __metadata("design:type", Array)
], User.prototype, "assignedTasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => [notification_entity_1.Notification]),
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (n) => n.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "updated_at", void 0);
exports.User = User = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map