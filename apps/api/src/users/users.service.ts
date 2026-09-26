import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { FindUsersQueryDto } from './dto/find-users-query.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private userSelect = {
    id: true,
    organizationId: true,
    email: true,
    fullName: true,
    phone: true,
    avatarUrl: true,
    status: true,
    roleId: true,
    createdAt: true,
    updatedAt: true,
    role: {
      select: {
        id: true,
        key: true,
        title: true,
        badge: true,
        badgeColor: true,
        permissions: true,
      },
    },
  };

  async create(createDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        organizationId: createDto.organizationId,
        email: createDto.email,
        fullName: createDto.fullName,
        phone: createDto.phone,
        roleId: createDto.roleId,
        avatarUrl: createDto.avatarUrl,
        status: createDto.status || 'ACTIVE',
      },
      select: this.userSelect,
    });
  }

  async findAll(query?: FindUsersQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      where: {
        ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...(query?.roleId ? { roleId: query.roleId } : {}),
        ...(query?.search
          ? {
              OR: [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: this.userSelect,
      skip,
      take: limit,
      orderBy: { createdAt: query?.sortOrder || 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(updateDto.fullName ? { fullName: updateDto.fullName } : {}),
        ...(updateDto.email ? { email: updateDto.email } : {}),
        ...(updateDto.phone !== undefined ? { phone: updateDto.phone } : {}),
        ...(updateDto.roleId !== undefined ? { roleId: updateDto.roleId } : {}),
        ...(updateDto.avatarUrl !== undefined ? { avatarUrl: updateDto.avatarUrl } : {}),
        ...(updateDto.status ? { status: updateDto.status } : {}),
      },
      select: this.userSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true },
    });
  }
}
