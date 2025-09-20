import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { CacheService } from '../cache/cache.service';
import { SearchService } from '../search/search.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectsRepository: jest.Mocked<Repository<Project>>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockSearchService: jest.Mocked<SearchService>;

  beforeEach(async () => {
    mockProjectsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
    } as any;

    mockSearchService = {
      indexTask: jest.fn(),
      indexProject: jest.fn(),
      search: jest.fn(),
      searchTasks: jest.fn(),
      searchProjects: jest.fn(),
      removeTask: jest.fn(),
      removeProject: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached projects if available', async () => {
      const projects = [
        { 
          id: '1', 
          name: 'Project 1', 
          description: 'Description 1',
          owner: { id: '1' } as any,
          tasks: [] as any[],
          created_at: new Date(),
          updated_at: new Date()
        }
      ] as Project[];
      
      mockCacheService.get.mockResolvedValue(projects);

      const result = await service.findAll();
      
      expect(mockCacheService.get).toHaveBeenCalledWith('projects:all');
      expect(result).toEqual(projects);
    });

    it('should fetch from database and cache if not cached', async () => {
      const projects = [
        { 
          id: '1', 
          name: 'Project 1', 
          description: 'Description 1',
          owner: { id: '1' } as any,
          tasks: [] as any[],
          created_at: new Date(),
          updated_at: new Date()
        }
      ] as Project[];
      
      mockCacheService.get.mockResolvedValue(null);
      mockProjectsRepository.find.mockResolvedValue(projects);

      const result = await service.findAll();
      
      expect(mockCacheService.get).toHaveBeenCalledWith('projects:all');
      expect(mockProjectsRepository.find).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('projects:all', projects, 300);
      expect(result).toEqual(projects);
    });
  });

  describe('create', () => {
    it('should create a project, invalidate cache, and index in search', async () => {
      const createProjectDto = { name: 'New Project', description: 'Test description' };
      const userId = '1';
      const savedProject = { 
        id: '1', 
        ...createProjectDto, 
        owner: { id: userId } as any,
        tasks: [] as any[],
        created_at: new Date(),
        updated_at: new Date()
      } as Project;
      
      mockProjectsRepository.create.mockReturnValue(savedProject);
      mockProjectsRepository.save.mockResolvedValue(savedProject);

      const result = await service.create(createProjectDto, userId);
      
      expect(mockProjectsRepository.create).toHaveBeenCalledWith({
        ...createProjectDto,
        owner: { id: userId },
      });
      expect(mockProjectsRepository.save).toHaveBeenCalledWith(savedProject);
      expect(mockCacheService.del).toHaveBeenCalledWith('projects:all');
      expect(mockSearchService.indexProject).toHaveBeenCalledWith(savedProject);
      expect(result).toEqual(savedProject);
    });
  });
});