import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockProjectsRepository:any;
  let mockTasksRepository:any;
  let mockUsersRepository:any;

  beforeEach(async () => {
    mockProjectsRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      })),
      findOne: jest.fn(),
    };

    mockTasksRepository = {
      count: jest.fn(),
    };

    mockUsersRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProjectStats', () => {
    it('should return project statistics', async () => {
      mockProjectsRepository.count.mockResolvedValue(5);
      
      const result = await service.getProjectStats();
      
      expect(mockProjectsRepository.count).toHaveBeenCalled();
      expect(mockProjectsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({
        totalProjects: 5,
        activeProjects: 2,
        completedProjects: 3,
      });
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      mockTasksRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // todo
        .mockResolvedValueOnce(3)  // in_progress
        .mockResolvedValueOnce(3); // done
      
      const result = await service.getTaskStats();
      
      expect(mockTasksRepository.count).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        totalTasks: 10,
        todoTasks: 4,
        inProgressTasks: 3,
        doneTasks: 3,
        completionRate: 30,
      });
    });
  });
});