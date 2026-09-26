import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { FindGroupsQueryDto } from './dto/find-groups-query.dto.js';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        organizationId: createDto.organizationId,
        name: createDto.name,
        description: createDto.description,
        colorAccent: createDto.colorAccent || '#FF6C41',
        rotationCycleWeeks: createDto.rotationCycleWeeks || 1,
        rotationCycleType: createDto.rotationCycleType || 'WEEKLY',
        customRotationValue: createDto.customRotationValue,
        customRotationUnit: createDto.customRotationUnit,
        fairnessPoolEnabled: createDto.fairnessPoolEnabled ?? true,
      },
    });

    if (createDto.memberTalentIds && createDto.memberTalentIds.length > 0) {
      await this.prisma.groupMember.createMany({
        data: createDto.memberTalentIds.map((talentId) => ({
          groupId: group.id,
          talentId,
        })),
        skipDuplicates: true,
      });
    }

    if (createDto.inventoryRequirements && createDto.inventoryRequirements.length > 0) {
      for (const req of createDto.inventoryRequirements) {
        const createdReq = await this.prisma.inventoryRequirement.create({
          data: {
            organizationId: createDto.organizationId,
            groupId: group.id,
            itemName: req.itemName,
            category: req.category || 'INVENTORY',
            assignedGender: req.assignedGender || 'ANY',
            requiredHeadcount: req.requiredHeadcount || 1,
            position: req.position,
            notes: req.notes,
            rotationCycle: req.rotationCycle || 'EVERY_SHOW',
          },
        });

        if (req.pinnedTalentId) {
          await this.prisma.requirementPinnedTalent.create({
            data: {
              requirementId: createdReq.id,
              talentId: req.pinnedTalentId,
              isExclusive: true,
            },
          });
        } else if (req.pinnedTalentIds && req.pinnedTalentIds.length > 0) {
          await this.prisma.requirementPinnedTalent.createMany({
            data: req.pinnedTalentIds.map((talentId) => ({
              requirementId: createdReq.id,
              talentId,
              isExclusive: false,
            })),
          });
        }
      }
    }

    return this.findOne(group.id);
  }

  async findAll(query?: FindGroupsQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    return this.prisma.group.findMany({
      where: {
        ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query?.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        members: {
          include: {
            talent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                gender: true,
                status: true,
                avatarUrl: true,
                primarySkill: true,
              },
            },
          },
        },
        requirements: {
          include: {
            pinnedTalents: {
              include: {
                talent: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            shows: true,
            members: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: query?.sortOrder || 'desc' },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            talent: true,
          },
        },
        requirements: {
          include: {
            pinnedTalents: {
              include: {
                talent: true,
              },
            },
          },
        },
        shows: {
          orderBy: { startDateTime: 'asc' },
          take: 10,
        },
        _count: {
          select: {
            shows: true,
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(id: string, updateDto: UpdateGroupDto) {
    await this.findOne(id);

    await this.prisma.group.update({
      where: { id },
      data: {
        ...(updateDto.name ? { name: updateDto.name } : {}),
        ...(updateDto.description !== undefined ? { description: updateDto.description } : {}),
        ...(updateDto.colorAccent ? { colorAccent: updateDto.colorAccent } : {}),
        ...(updateDto.rotationCycleWeeks !== undefined
          ? { rotationCycleWeeks: updateDto.rotationCycleWeeks }
          : {}),
        ...(updateDto.rotationCycleType ? { rotationCycleType: updateDto.rotationCycleType } : {}),
        ...(updateDto.customRotationValue !== undefined
          ? { customRotationValue: updateDto.customRotationValue }
          : {}),
        ...(updateDto.customRotationUnit !== undefined
          ? { customRotationUnit: updateDto.customRotationUnit }
          : {}),
        ...(updateDto.fairnessPoolEnabled !== undefined
          ? { fairnessPoolEnabled: updateDto.fairnessPoolEnabled }
          : {}),
      },
    });

    if (updateDto.memberTalentIds) {
      await this.prisma.groupMember.deleteMany({
        where: { groupId: id },
      });

      if (updateDto.memberTalentIds.length > 0) {
        await this.prisma.groupMember.createMany({
          data: updateDto.memberTalentIds.map((talentId) => ({
            groupId: id,
            talentId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.group.delete({ where: { id } });
  }

  async addMember(groupId: string, talentId: string, roleNote?: string) {
    await this.findOne(groupId);

    return this.prisma.groupMember.upsert({
      where: {
        groupId_talentId: { groupId, talentId },
      },
      create: {
        groupId,
        talentId,
        roleNote,
      },
      update: {
        roleNote,
      },
      include: {
        talent: true,
      },
    });
  }

  async removeMember(groupId: string, talentId: string) {
    await this.findOne(groupId);

    return this.prisma.groupMember.delete({
      where: {
        groupId_talentId: { groupId, talentId },
      },
    });
  }
}
