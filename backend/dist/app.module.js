"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const projects_module_1 = require("./modules/projects/projects.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const bull_1 = require("@nestjs/bull");
const elasticsearch_module_1 = require("./modules/search/elasticsearch.module");
const search_module_1 = require("./modules/search/search.module");
const cache_module_1 = require("./modules/cache/cache.module");
const configuration_1 = __importDefault(require("./config/configuration"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                }),
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'redis',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10),
                },
            }),
            cache_module_1.CacheModuleConfig,
            elasticsearch_module_1.ElasticsearchModule,
            search_module_1.SearchModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map