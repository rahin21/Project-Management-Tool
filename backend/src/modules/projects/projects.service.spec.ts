import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    mockSearchService = {
      indexProject: jest.fn(),
      removeProject: jest.fn(),
      searchProjects: jest.fn(),
    };

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
      const cachedProjects = [{ id: '1', name: 'Test Project' }];
      mockCacheService.get.mockResolvedValue(cachedProjects);

      const result = await service.findAll();
      
      expect(mockCacheService.get).toHaveBeenCalledWith('projects:all');
      expect(mockProjectsRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual(cachedProjects);
    });

    it('should fetch and cache projects if not in cache', async () => {
      const projects = [{ id: '1', name: 'Test Project' }];
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
      const savedProject = { id: '1', ...createProjectDto, owner: { id: userId } };
      
      mockProjectsRepository.create.mockReturnValue(savedProject);
      mockProjectsRepository.save.mockResolvedValue(savedProject);

      const result = await service.create(createProjectDto, userId);
      
      expect(mockProjectsRepository.create).toHaveBeenCalledWith({
        ...createProjectDto,
        owner: { id: userId },
      });
      expect(mockProjectsRepository.save).toHaveBeenCalledWith(savedProject);
      expect(mockCacheService.delete).toHaveBeenCalledWith('projects:all');
      expect(mockSearchService.indexProject).toHaveBeenCalledWith(savedProject);
      expect(result).toEqual(savedProject);
    });
  });
});