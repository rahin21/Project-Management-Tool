import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projects')
  getProjectStats() {
    return this.analyticsService.getProjectStats();
  }

  @Get('tasks')
  getTaskStats() {
    return this.analyticsService.getTaskStats();
  }

  @Get('users/productivity')
  getUserProductivity() {
    return this.analyticsService.getUserProductivity();
  }

  @Get('projects/:id/progress')
  getProjectProgress(@Param('id') id: string) {
    return this.analyticsService.getProjectProgress(id);
  }

  @Get('time-based')
  getTimeBasedAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getTimeBasedAnalytics(
      new Date(startDate),
      new Date(endDate),
    );
  }
}