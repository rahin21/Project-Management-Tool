"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGraphQLModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const projects_module_1 = require("../projects/projects.module");
const tasks_module_1 = require("../tasks/tasks.module");
const users_module_1 = require("../users/users.module");
const notifications_module_1 = require("../notifications/notifications.module");
const project_resolver_1 = require("./resolvers/project.resolver");
const task_resolver_1 = require("./resolvers/task.resolver");
const notification_resolver_1 = require("./resolvers/notification.resolver");
let AppGraphQLModule = class AppGraphQLModule {
};
exports.AppGraphQLModule = AppGraphQLModule;
exports.AppGraphQLModule = AppGraphQLModule = __decorate([
    (0, common_1.Module)({
        imports: [
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: true,
                introspection: true,
                context: ({ req }) => ({ req }),
            }),
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            users_module_1.UsersModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [project_resolver_1.ProjectResolver, task_resolver_1.TaskResolver, notification_resolver_1.NotificationResolver],
    })
], AppGraphQLModule);
//# sourceMappingURL=graphql.module.js.map