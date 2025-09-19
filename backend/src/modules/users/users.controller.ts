import { Body, Controller, Get, Post, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(@Body() body: { name: string; email: string; password: string; role: UserRole }) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(body.email);
      if (existingUser) {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }
      
      // Create new user
      const user = await this.usersService.create({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role || 'member',
      });
      
      // Remove password from response
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('seed-admin')
  seedAdmin(@Body() body: { name?: string; email?: string; password?: string }) {
    return this.usersService.create({
      name: body.name || 'Admin',
      email: body.email || 'admin@example.com',
      password: body.password || 'admin123',
      role: UserRole.ADMIN,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return users.map((user: User) => {
      const { password, ...result } = user;
      return result;
    });
  }

  @Get('health')
  health() {
    return { ok: true };
  }
}


