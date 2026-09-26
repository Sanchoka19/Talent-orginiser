import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';
import { FindInventoryQueryDto } from './dto/find-inventory-query.dto.js';
import { PinTalentDto } from './dto/pin-talent.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateInventoryDto) {
    const requirement = await this.prisma.inventoryRequirement.create({
      data: {
        organizationId: createDto.organizationId,
        groupId: createDto.groupId,
        parentTaskId: createDto.parentTaskId,
        itemName: createDto.itemName,
        category: createDto.category || 'INVENTORY',
        assignedGender: createDto.assignedGender || 'ANY',
        requiredHeadcount: createDto.requiredHeadcount || 1,
        position: createDto.position,
        notes: createDto.notes,
        rotationCycle: createDto.rotationCycle || 'EVERY_SHOW',
        customRotationValue: createDto.customRotationValue,
        customRotationUnit: createDto.customRotationUnit,
      },
    });

    if (createDto.pinnedTalentId) {
      await this.prisma.requirementPinnedTalent.create({
        data: {
          requirementId: requirement.id,
          talentId: createDto.pinnedTalentId,
          isExclusive: true,
        },
      });
    } else if (createDto.pinnedTalentIds && createDto.pinnedTalentIds.length > 0) {
      await this.prisma.requirementPinnedTalent.createMany({
        data: createDto.pinnedTalentIds.map((talentId) => ({
          requirementId: requirement.id,
          talentId,
          isExclusive: false,
        })),
      });
    }

    return this.findOne(requirement.id);
  }

  async findAll(query?: FindInventoryQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    return this.prisma.inventoryRequirement.findMany({
      where: {
        ...(query?.groupId ? { groupId: query.groupId } : {}),
        ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query?.search
          ? {
              OR: [
                { itemName: { contains: query.search, mode: 'insensitive' } },
                { position: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        pinnedTalents: {
          include: {
            talent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                status: true,
                avatarUrl: true,
              },
            },
          },
        },
        subSlots: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const req = await this.prisma.inventoryRequirement.findUnique({
      where: { id },
      include: {
        pinnedTalents: {
          include: {
            talent: true,
          },
        },
        subSlots: true,
        group: { select: { id: true, name: true } },
      },
    });

    if (!req) {
      throw new NotFoundException(`InventoryRequirement with ID ${id} not found`);
    }

    return req;
  }

  async update(id: string, updateDto: UpdateInventoryDto) {
    await this.findOne(id);

    await this.prisma.inventoryRequirement.update({
      where: { id },
      data: {
        ...(updateDto.itemName ? { itemName: updateDto.itemName } : {}),
        ...(updateDto.category ? { category: updateDto.category } : {}),
        ...(updateDto.assignedGender ? { assignedGender: updateDto.assignedGender } : {}),
        ...(updateDto.requiredHeadcount !== undefined
          ? { requiredHeadcount: updateDto.requiredHeadcount }
          : {}),
        ...(updateDto.position !== undefined ? { position: updateDto.position } : {}),
        ...(updateDto.notes !== undefined ? { notes: updateDto.notes } : {}),
        ...(updateDto.rotationCycle ? { rotationCycle: updateDto.rotationCycle } : {}),
        ...(updateDto.customRotationValue !== undefined
          ? { customRotationValue: updateDto.customRotationValue }
          : {}),
        ...(updateDto.customRotationUnit !== undefined
          ? { customRotationUnit: updateDto.customRotationUnit }
          : {}),
      },
    });

    // Update pinned talents if explicitly provided
    if (updateDto.pinnedTalentId) {
      await this.prisma.requirementPinnedTalent.deleteMany({
        where: { requirementId: id },
      });
      await this.prisma.requirementPinnedTalent.create({
        data: {
          requirementId: id,
          talentId: updateDto.pinnedTalentId,
          isExclusive: true,
        },
      });
    } else if (updateDto.pinnedTalentIds) {
      await this.prisma.requirementPinnedTalent.deleteMany({
        where: { requirementId: id },
      });
      if (updateDto.pinnedTalentIds.length > 0) {
        await this.prisma.requirementPinnedTalent.createMany({
          data: updateDto.pinnedTalentIds.map((talentId) => ({
            requirementId: id,
            talentId,
            isExclusive: false,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryRequirement.delete({ where: { id } });
  }

  async pinTalent(
    requirementId: string,
    talentId: string,
    isExclusiveOrDto?: boolean | PinTalentDto,
  ) {
    await this.findOne(requirementId);
    const isExclusive =
      typeof isExclusiveOrDto === 'boolean'
        ? isExclusiveOrDto
        : isExclusiveOrDto?.isExclusive ?? true;

    return this.prisma.requirementPinnedTalent.upsert({
      where: {
        requirementId_talentId: { requirementId, talentId },
      },
      create: {
        requirementId,
        talentId,
        isExclusive,
      },
      update: {
        isExclusive,
      },
      include: {
        talent: true,
      },
    });
  }

  async unpinTalent(requirementId: string, talentId: string) {
    await this.findOne(requirementId);

    return this.prisma.requirementPinnedTalent.delete({
      where: {
        requirementId_talentId: { requirementId, talentId },
      },
    });
  }
}
