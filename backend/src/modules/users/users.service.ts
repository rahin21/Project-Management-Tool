import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(data: { name: string; email: string; password: string; role: UserRole }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.repo.create({ ...data, password: passwordHash });
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findAll() {
    return this.repo.find();
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}


