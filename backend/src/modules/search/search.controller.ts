import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('tasks')
  async searchTasks(@Query('q') query: string) {
    return this.searchService.searchTasks(query);
  }

  @Get('projects')
  async searchProjects(@Query('q') query: string) {
    return this.searchService.searchProjects(query);
  }
}