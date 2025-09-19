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
exports.ProjectResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const projects_service_1 = require("../../projects/projects.service");
const project_entity_1 = require("../../projects/project.entity");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const user_entity_1 = require("../../users/user.entity");
const create_project_input_1 = require("../inputs/create-project.input");
const update_project_input_1 = require("../inputs/update-project.input");
let ProjectResolver = class ProjectResolver {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async projects() {
        return this.projectsService.findAll();
    }
    async project(id) {
        return this.projectsService.findOne(id.toString());
    }
    async createProject(input, user) {
        return this.projectsService.create(input, user.id);
    }
    async updateProject(id, input) {
        return this.projectsService.update(id.toString(), input);
    }
    async deleteProject(id) {
        await this.projectsService.remove(id.toString());
        return true;
    }
};
exports.ProjectResolver = ProjectResolver;
__decorate([
    (0, graphql_1.Query)(() => [project_entity_1.Project]),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "projects", null);
__decorate([
    (0, graphql_1.Query)(() => project_entity_1.Project),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "project", null);
__decorate([
    (0, graphql_1.Mutation)(() => project_entity_1.Project),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_input_1.CreateProjectInput,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "createProject", null);
__decorate([
    (0, graphql_1.Mutation)(() => project_entity_1.Project),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.Int })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_project_input_1.UpdateProjectInput]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "updateProject", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProjectResolver.prototype, "deleteProject", null);
exports.ProjectResolver = ProjectResolver = __decorate([
    (0, graphql_1.Resolver)(() => project_entity_1.Project),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectResolver);
//# sourceMappingURL=project.resolver.js.map