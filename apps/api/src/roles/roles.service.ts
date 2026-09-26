import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        organizationId: createDto.organizationId,
        key: createDto.key,
        title: createDto.title,
        badge: createDto.badge,
        badgeColor: createDto.badgeColor || '#0891B2',
        description: createDto.description,
        permissions: createDto.permissions,
        isSystem: createDto.isSystem ?? false,
      },
    });
  }

  async findAll(organizationId?: string) {
    return this.prisma.role.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, fullName: true, email: true, status: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateDto: UpdateRoleDto) {
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(updateDto.title ? { title: updateDto.title } : {}),
        ...(updateDto.badge ? { badge: updateDto.badge } : {}),
        ...(updateDto.badgeColor ? { badgeColor: updateDto.badgeColor } : {}),
        ...(updateDto.description !== undefined ? { description: updateDto.description } : {}),
        ...(updateDto.permissions ? { permissions: updateDto.permissions } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.delete({ where: { id } });
  }
}
