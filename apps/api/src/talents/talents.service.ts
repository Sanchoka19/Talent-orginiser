import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTalentDto } from './dto/create-talent.dto.js';
import { UpdateTalentDto } from './dto/update-talent.dto.js';
import { CreateContractRecordDto } from './dto/create-contract.dto.js';
import { FindTalentsQueryDto } from './dto/find-talents-query.dto.js';
import { FindDossiersQueryDto } from './dto/find-dossiers-query.dto.js';

@Injectable()
export class TalentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateTalentDto) {
    return this.prisma.talent.create({
      data: {
        organizationId: createDto.organizationId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        email: createDto.email,
        phone: createDto.phone,
        gender: createDto.gender,
        heightCm: createDto.heightCm,
        weightKg: createDto.weightKg,
        status: createDto.status || 'ACTIVE',
        primarySkill: createDto.primarySkill,
        secondarySkills: createDto.secondarySkills || [],
        avatarUrl: createDto.avatarUrl,
        notes: createDto.notes,
        rehireStatus: createDto.rehireStatus || 'ELIGIBLE',
        contractExpiryDate: createDto.contractExpiryDate
          ? new Date(createDto.contractExpiryDate)
          : null,
        contractStatus: createDto.contractStatus || 'ACTIVE',
        isArchived: createDto.isArchived ?? false,
        terminationReason: createDto.terminationReason,
        terminationDate: createDto.terminationDate
          ? new Date(createDto.terminationDate)
          : null,
      },
      include: {
        documents: true,
        contracts: true,
      },
    });
  }

  async findAll(query?: FindTalentsQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    return this.prisma.talent.findMany({
      where: {
        ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...(query?.isArchived !== undefined ? { isArchived: query.isArchived } : {}),
        ...(query?.search
          ? {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { primarySkill: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        documents: true,
        contracts: true,
        groupMemberships: {
          include: {
            group: {
              select: { id: true, name: true, colorAccent: true },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: query?.sortOrder || 'desc' },
    });
  }

  async findOne(id: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id },
      include: {
        documents: true,
        contracts: {
          include: {
            reviewedBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
          orderBy: { reviewDate: 'desc' },
        },
        groupMemberships: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!talent) {
      throw new NotFoundException(`Talent with ID ${id} not found`);
    }

    return talent;
  }

  async update(id: string, updateDto: UpdateTalentDto) {
    await this.findOne(id);

    const isTerminatedOrArchived =
      updateDto.isArchived === true ||
      updateDto.contractStatus === 'TERMINATED' ||
      updateDto.status === 'TERMINATED';

    const updated = await this.prisma.talent.update({
      where: { id },
      data: {
        ...(updateDto.firstName ? { firstName: updateDto.firstName } : {}),
        ...(updateDto.lastName ? { lastName: updateDto.lastName } : {}),
        ...(updateDto.email ? { email: updateDto.email } : {}),
        ...(updateDto.phone ? { phone: updateDto.phone } : {}),
        ...(updateDto.gender ? { gender: updateDto.gender } : {}),
        ...(updateDto.heightCm !== undefined ? { heightCm: updateDto.heightCm } : {}),
        ...(updateDto.weightKg !== undefined ? { weightKg: updateDto.weightKg } : {}),
        ...(updateDto.status ? { status: updateDto.status } : {}),
        ...(updateDto.primarySkill ? { primarySkill: updateDto.primarySkill } : {}),
        ...(updateDto.secondarySkills
          ? { secondarySkills: updateDto.secondarySkills }
          : {}),
        ...(updateDto.avatarUrl !== undefined ? { avatarUrl: updateDto.avatarUrl } : {}),
        ...(updateDto.notes !== undefined ? { notes: updateDto.notes } : {}),
        ...(updateDto.rehireStatus ? { rehireStatus: updateDto.rehireStatus } : {}),
        ...(updateDto.contractExpiryDate !== undefined
          ? {
              contractExpiryDate: updateDto.contractExpiryDate
                ? new Date(updateDto.contractExpiryDate)
                : null,
            }
          : {}),
        ...(updateDto.contractStatus ? { contractStatus: updateDto.contractStatus } : {}),
        ...(updateDto.isArchived !== undefined
          ? { isArchived: updateDto.isArchived }
          : {}),
        ...(updateDto.terminationReason !== undefined
          ? { terminationReason: updateDto.terminationReason }
          : {}),
        ...(updateDto.terminationDate !== undefined
          ? {
              terminationDate: updateDto.terminationDate
                ? new Date(updateDto.terminationDate)
                : null,
            }
          : {}),
      },
    });

    if (isTerminatedOrArchived) {
      await this.prisma.dutyAssignmentPerformer.deleteMany({
        where: {
          talentId: id,
          dutyAssignment: {
            showEvent: {
              startDateTime: { gte: new Date() },
            },
          },
        },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.talent.delete({ where: { id } });
  }

  async addContractRecord(talentId: string, contractDto: CreateContractRecordDto) {
    await this.findOne(talentId);

    return this.prisma.contractRecord.create({
      data: {
        talentId,
        reviewedById: contractDto.reviewedById,
        projectName: contractDto.projectName,
        location: contractDto.location,
        period: contractDto.period,
        startDate: new Date(contractDto.startDate),
        endDate: new Date(contractDto.endDate),
        contractStatus: contractDto.contractStatus || 'COMPLETED',
        rating: contractDto.rating,
        rehireStatus: contractDto.rehireStatus || 'ELIGIBLE',
        terminationReason: contractDto.terminationReason,
        initiator: contractDto.initiator || 'MUTUAL',
        internalNote: contractDto.internalNote,
        reviewType: contractDto.reviewType || 'END_OF_SEASON',
        reviewDate: contractDto.reviewDate
          ? new Date(contractDto.reviewDate)
          : new Date(),
        scorePunctuality: contractDto.scorePunctuality,
        scorePerformance: contractDto.scorePerformance,
        scoreTeamwork: contractDto.scoreTeamwork,
        scoreGearCare: contractDto.scoreGearCare,
      },
      include: {
        reviewedBy: true,
      },
    });
  }

  async getArchiveDossiers(query?: FindDossiersQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    let yearFilter: any = {};
    if (query?.year) {
      const yearStart = new Date(`${query.year}-01-01T00:00:00.000Z`);
      const yearEnd = new Date(`${query.year}-12-31T23:59:59.999Z`);
      yearFilter = {
        reviewDate: {
          gte: yearStart,
          lte: yearEnd,
        },
      };
    }

    return this.prisma.contractRecord.findMany({
      where: {
        ...(query?.contractStatus ? { contractStatus: query.contractStatus } : {}),
        ...(query?.rehireStatus ? { rehireStatus: query.rehireStatus } : {}),
        ...yearFilter,
        talent: {
          ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        },
      },
      include: {
        talent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            primarySkill: true,
            avatarUrl: true,
            email: true,
            phone: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { reviewDate: query?.sortOrder || 'desc' },
    });
  }
}
