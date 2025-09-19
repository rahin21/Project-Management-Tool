import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectResolver } from './resolvers/project.resolver';
import { TaskResolver } from './resolvers/task.resolver';
import { NotificationResolver } from './resolvers/notification.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    ProjectsModule,
    TasksModule,
    UsersModule,
    NotificationsModule,
  ],
  providers: [ProjectResolver, TaskResolver, NotificationResolver],
})
export class AppGraphQLModule {}