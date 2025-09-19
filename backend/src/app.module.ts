import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BullModule } from '@nestjs/bull';
import { ElasticsearchModule } from './modules/search/elasticsearch.module';
import { SearchModule } from './modules/search/search.module';
import { User } from './modules/users/user.entity';
import { Project } from './modules/projects/project.entity';
import { Task } from './modules/tasks/task.entity';
import { TaskDependency } from './modules/tasks/task-dependency.entity';
import { Notification } from './modules/notifications/notification.entity';
import { CacheModuleConfig } from './modules/cache/cache.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    CacheModuleConfig,
    ElasticsearchModule,
    SearchModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


