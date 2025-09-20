# Development Guide

> Comprehensive guide for developers working on the Project Management Tool, covering setup, testing, contribution guidelines, and best practices.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Testing Strategy](#testing-strategy)
5. [Code Quality Standards](#code-quality-standards)
6. [Contribution Guidelines](#contribution-guidelines)
7. [Debugging Guide](#debugging-guide)
8. [Performance Guidelines](#performance-guidelines)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

***

## Development Environment Setup

### Prerequisites

* **Node.js**: v18.0.0 or higher

* **npm**: v8.0.0 or higher

* **Docker**: v20.0.0 or higher

* **Docker Compose**: v2.0.0 or higher

* **Git**: v2.30.0 or higher

* **PostgreSQL**: v15.0 or higher (optional, can use Docker)

* **Redis**: v7.0 or higher (optional, can use Docker)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-username/project-management-tool.git
cd project-management-tool

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development services
docker-compose up -d postgres redis elasticsearch

# Run database migrations
cd backend
npm run migration:run
npm run seed:dev

# Start development servers
npm run start:dev &
cd ../frontend
npm run dev
```

### IDE Configuration

#### VS Code Settings

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.workingDirectories": ["backend", "frontend"],
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

#### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers",
    "GraphQL.vscode-graphql",
    "ms-vscode.vscode-jest"
  ]
}
```

### Environment Variables

#### Backend Development (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=pmtool_user
DB_PASSWORD=pmtool_password
DB_NAME=pmtool_development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# JWT
JWT_SECRET=your-development-jwt-secret-key
JWT_EXPIRES_IN=1d

# Development specific
NODE_ENV=development
PORT=3001
API_PREFIX=api
LOG_LEVEL=debug

# External services (development)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT=http://localhost:9000
AWS_S3_BUCKET=pmtool-dev
```

#### Frontend Development (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

***

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   └── dto/
│   │   ├── users/                # User management
│   │   ├── projects/             # Project management
│   │   ├── tasks/                # Task management
│   │   ├── notifications/        # Real-time notifications
│   │   ├── analytics/            # Analytics and reporting
│   │   ├── search/               # Search functionality
│   │   └── cache/                # Caching module
│   ├── common/
│   │   ├── decorators/           # Custom decorators
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Global guards
│   │   ├── interceptors/         # Global interceptors
│   │   ├── pipes/                # Validation pipes
│   │   └── utils/                # Utility functions
│   ├── config/
│   │   ├── configuration.ts      # App configuration
│   │   ├── database.config.ts    # Database configuration
│   │   └── validation.schema.ts  # Environment validation
│   ├── database/
│   │   ├── entities/             # TypeORM entities
│   │   ├── migrations/           # Database migrations
│   │   └── seeds/                # Database seeders
│   ├── graphql/
│   │   ├── resolvers/            # GraphQL resolvers
│   │   ├── types/                # GraphQL types
│   │   └── schema.gql            # Generated schema
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── e2e/                      # End-to-end tests
│   └── fixtures/                 # Test fixtures
├── scripts/
│   ├── seed.ts                   # Database seeding
│   └── migrate.ts                # Migration runner
└── package.json
```

### Frontend Structure

```
frontend/
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── forms/                    # Form components
│   ├── charts/                   # Chart components
│   └── features/                 # Feature-specific components
│       ├── auth/
│       ├── projects/
│       ├── tasks/
│       └── analytics/
├── contexts/
│   ├── AuthContext.tsx           # Authentication context
│   ├── ThemeContext.tsx          # Theme context
│   └── SocketContext.tsx         # WebSocket context
├── hooks/
│   ├── useAuth.ts                # Authentication hook
│   ├── useSocket.ts              # WebSocket hook
│   └── useLocalStorage.ts        # Local storage hook
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth utilities
│   ├── socket.ts                 # Socket.io client
│   └── utils.ts                  # Utility functions
├── pages/
│   ├── api/                      # API routes (if needed)
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── analytics/
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── styles/
│   ├── globals.css
│   └── components.css
├── types/
│   ├── api.ts                    # API type definitions
│   ├── auth.ts                   # Auth type definitions
│   └── index.ts
└── package.json
```

***

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/task-dependencies

# Make changes and commit
git add .
git commit -m "feat: implement task dependency management"

# Push and create PR
git push origin feature/task-dependencies
# Create pull request on GitHub

# After review, merge to main
git checkout main
git pull origin main
git branch -d feature/task-dependencies
```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

* `feat`: New feature

* `fix`: Bug fix

* `docs`: Documentation changes

* `style`: Code style changes (formatting, etc.)

* `refactor`: Code refactoring

* `test`: Adding or updating tests

* `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add JWT refresh token functionality
fix(tasks): resolve task deletion cascade issue
docs: update API documentation for user endpoints
test(projects): add unit tests for project service
```

### Branch Naming Convention

* `feature/description` - New features

* `fix/description` - Bug fixes

* `hotfix/description` - Critical fixes

* `docs/description` - Documentation updates

* `refactor/description` - Code refactoring

***

## Testing Strategy

### Backend Testing

#### Unit Tests

```typescript
// src/modules/tasks/tasks.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const tasks = [{ id: '1', title: 'Test Task' }];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll();
      expect(result).toEqual(tasks);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const createTaskDto = { title: 'New Task', description: 'Test' };
      const savedTask = { id: '1', ...createTaskDto };
      
      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);

      const result = await service.create(createTaskDto);
      expect(result).toEqual(savedTask);
      expect(repository.create).toHaveBeenCalledWith(createTaskDto);
      expect(repository.save).toHaveBeenCalledWith(savedTask);
    });
  });
});
```

#### Integration Tests

```typescript
// test/integration/tasks.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';

describe('Tasks Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.access_token;
  });

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Integration Test Task',
        description: 'Test description',
        priority: 'HIGH',
      };

      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTaskDto)
        .expect(201);

      expect(response.body).toMatchObject({
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
      });
      expect(response.body.id).toBeDefined();
    });
  });

  describe('GET /api/tasks', () => {
    it('should return paginated tasks', async () => {
      // Create test tasks
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task 1', description: 'Description 1' });

      const response = await request(app.getHttpServer())
        .get('/api/tasks?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });
  });
});
```

#### E2E Tests

```typescript
// test/e2e/task-workflow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Task Workflow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup test data
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.access_token;

    const projectResponse = await request(app.getHttpServer())
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Project', description: 'E2E Test Project' });
    
    projectId = projectResponse.body.id;
  });

  it('should complete full task lifecycle', async () => {
    // 1. Create task
    const createResponse = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'E2E Test Task',
        description: 'End-to-end test task',
        projectId,
        priority: 'HIGH',
      })
      .expect(201);

    const taskId = createResponse.body.id;

    // 2. Update task
    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    // 3. Add comment
    await request(app.getHttpServer())
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'Task progress update' })
      .expect(201);

    // 4. Complete task
    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    // 5. Verify final state
    const finalResponse = await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(finalResponse.body.status).toBe('COMPLETED');
  });
});
```

### Frontend Testing

#### Component Tests

```typescript
// components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

#### Hook Tests

```typescript
// hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../contexts/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### Test Scripts

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e --runInBand",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

***

## Code Quality Standards

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "@nestjs/eslint-config",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Husky Pre-commit Hooks

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

### SonarQube Configuration

```properties
# sonar-project.properties
sonar.projectKey=project-management-tool
sonar.projectName=Project Management Tool
sonar.projectVersion=1.0.0

sonar.sources=backend/src,frontend/components,frontend/pages
sonar.tests=backend/test,frontend/__tests__
sonar.exclusions=**/*.spec.ts,**/*.test.ts,**/node_modules/**

sonar.typescript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info

sonar.qualitygate.wait=true
```

***

## Contribution Guidelines

### Pull Request Process

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/project-management-tool.git
   cd project-management-tool
   git remote add upstream https://github.com/original-owner/project-management-tool.git
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**

   * Follow coding standards

   * Add tests for new functionality

   * Update documentation if needed

4. **Test Your Changes**

   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

5. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create PR**

   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests added for new functionality

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional information]
```

### Code Review Guidelines

#### For Authors

* Keep PRs small and focused

* Write clear commit messages

* Add comprehensive tests

* Update documentation

* Respond to feedback promptly

#### For Reviewers

* Review within 24-48 hours

* Be constructive and specific

* Test the changes locally

* Check for security issues

* Verify test coverage

***

## Debugging Guide

### Backend Debugging

#### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "args": [],
      "runtimeArgs": ["-r", "ts-node/register"],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/backend/.env",
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "port": 9229,
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "windows": {
        "program": "${workspaceFolder}/backend/node_modules/jest/bin/jest"
      }
    }
  ]
}
```

#### Logging Best Practices

```typescript
// src/common/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: string, context?: string): void {
    console.log(`[${new Date().toISOString()}] [LOG] [${context}] ${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    console.error(`[${new Date().toISOString()}] [ERROR] [${context}] ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string): void {
    console.warn(`[${new Date().toISOString()}] [WARN] [${context}] ${message}`);
  }

  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${context}] ${message}`);
    }
  }
}
```

### Frontend Debugging

#### React DevTools

* Install React Developer Tools browser extension

* Use Components tab to inspect component state

* Use Profiler tab to identify performance issues

#### Redux DevTools (if using Redux)

```typescript
// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // your reducers
  },
  devTools: process.env.NODE_ENV !== 'production',
});
```

#### Console Debugging

```typescript
// Use structured logging
console.group('API Call');
console.log('URL:', url);
console.log('Method:', method);
console.log('Data:', data);
console.groupEnd();

// Use console.table for arrays/objects
console.table(users);

// Use console.time for performance
console.time('API Call');
// ... API call
console.timeEnd('API Call');
```

***

## Performance Guidelines

### Backend Performance

#### Database Optimization

```typescript
// Use proper indexing
@Entity()
@Index(['userId', 'createdAt'])
@Index(['status', 'priority'])
export class Task {
  // entity definition
}

// Use query optimization
@Injectable()
export class TasksService {
  async findUserTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { userId },
      relations: ['project', 'assignee'],
      select: ['id', 'title', 'status', 'priority'], // Only select needed fields
      order: { createdAt: 'DESC' },
      take: 50, // Limit results
    });
  }
}
```

#### Caching Strategy

```typescript
// Redis caching
@Injectable()
export class TasksService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findAll(): Promise<Task[]> {
    const cacheKey = 'tasks:all';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const tasks = await this.taskRepository.find();
    await this.redis.setex(cacheKey, 300, JSON.stringify(tasks)); // 5 min cache
    
    return tasks;
  }
}
```

### Frontend Performance

#### Code Splitting

```typescript
// pages/dashboard.tsx
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(() => import('../components/AnalyticsChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <AnalyticsChart />
    </div>
  );
}
```

#### Memoization

```typescript
// components/TaskList.tsx
import React, { memo, useMemo } from 'react';

interface TaskListProps {
  tasks: Task[];
  filter: string;
}

const TaskList = memo(({ tasks, filter }: TaskListProps) => {
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      task.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tasks, filter]);

  return (
    <div>
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
});

TaskList.displayName = 'TaskList';
export default TaskList;
```

***

## Security Best Practices

### Input Validation

```typescript
// dto/create-task.dto.ts
import { IsString, IsEnum, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsUUID()
  projectId: string;
}
```

### Authentication & Authorization

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### SQL Injection Prevention

```typescript
// Always use parameterized queries
@Injectable()
export class TasksService {
  async searchTasks(query: string): Promise<Task[]> {
    // Good: Using query builder with parameters
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.title ILIKE :query', { query: `%${query}%` })
      .getMany();

    // Bad: String concatenation (vulnerable to SQL injection)
    // return this.taskRepository.query(`SELECT * FROM tasks WHERE title LIKE '%${query}%'`);
  }
}
```

***

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Connect to database manually
psql -h localhost -p 5432 -U pmtool_user -d pmtool_development
```

#### Redis Connection Issues

```bash
# Check Redis status
docker-compose ps redis

# Connect to Redis
redis-cli -h localhost -p 6379

# Test Redis connection
redis-cli ping
```

#### Port Conflicts

```bash
# Check what's using a port
lsof -i :3001
netstat -tulpn | grep :3001

# Kill process using port
kill -9 <PID>
```

#### Memory Issues

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check Node.js memory usage
node --max-old-space-size=4096 dist/main.js
```

### Debug Commands

```bash
# Backend debugging
cd backend
npm run start:debug

# Frontend debugging
cd frontend
npm run dev

# Database debugging
npm run migration:show
npm run migration:revert

# Clear all caches
npm run cache:clear
docker system prune -a
```

### Performance Monitoring

```typescript
// Add performance monitoring
import { performance } from 'perf_hooks';

@Injectable()
export class PerformanceService {
  measureExecutionTime<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const end = performance.now();
      console.log(`${label} took ${end - start} milliseconds`);
    });
  }
}
```

This development guide provides comprehensive information for developers to effectively contribute to and maintain the Project Management Tool project.
