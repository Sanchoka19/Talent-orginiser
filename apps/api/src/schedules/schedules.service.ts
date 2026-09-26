import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConflictDetectorService } from './conflict-detector.service.js';
import { RotationEngineService } from '../duties/rotation-engine.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { FindSchedulesQueryDto } from './dto/find-schedules-query.dto.js';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conflictDetector: ConflictDetectorService,
    private readonly rotationEngine: RotationEngineService,
  ) {}

  async create(createDto: CreateScheduleDto) {
    const conflictResult = await this.conflictDetector.checkConflicts({
      organizationId: createDto.organizationId,
      groupId: createDto.groupId,
      hotelId: createDto.hotelId,
      startDateTime: createDto.startDateTime,
      endDateTime: createDto.endDateTime,
      lobbyDateTime: createDto.lobbyDateTime,
      lobbyTime: createDto.lobbyTime,
    });

    if (conflictResult.hasConflict) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'Schedule conflict detected',
          blockingConflicts: conflictResult.blockingConflicts,
          warningConflicts: conflictResult.warningConflicts,
        },
        HttpStatus.CONFLICT,
      );
    }

    const show = await this.prisma.showEvent.create({
      data: {
        organizationId: createDto.organizationId,
        groupId: createDto.groupId,
        hotelId: createDto.hotelId,
        title: createDto.title,
        startDateTime: new Date(createDto.startDateTime),
        endDateTime: new Date(createDto.endDateTime),
        lobbyDateTime: createDto.lobbyDateTime
          ? new Date(createDto.lobbyDateTime)
          : null,
        lobbyTime: createDto.lobbyTime,
        status: createDto.status || 'SCHEDULED',
        notes: createDto.notes,
        recurringGroupId: createDto.recurringGroupId,
      },
      include: {
        group: true,
        venue: true,
      },
    });

    if (createDto.autoAssignDuties !== false) {
      await this.rotationEngine.generateDutiesForShow(show.id);
    }

    return this.findOne(show.id);
  }

  async findAll(query?: FindSchedulesQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    let dateFilter: any = {};
    if (query?.fromDate || query?.toDate) {
      dateFilter = {
        startDateTime: {
          ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
          ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
        },
      };
    }

    return this.prisma.showEvent.findMany({
      where: {
        ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query?.groupId ? { groupId: query.groupId } : {}),
        ...(query?.hotelId ? { hotelId: query.hotelId } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...dateFilter,
      },
      include: {
        group: { select: { id: true, name: true, colorAccent: true } },
        venue: { select: { id: true, name: true, city: true } },
        dutyAssignments: {
          include: {
            assignedTalents: {
              include: {
                talent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    gender: true,
                    status: true,
                  },
                },
              },
            },
            overrides: {
              include: {
                originalTalent: {
                  select: { id: true, firstName: true, lastName: true },
                },
                replacementTalent: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { startDateTime: query?.sortOrder === 'desc' ? 'desc' : 'asc' },
    });
  }

  async findOne(id: string) {
    const show = await this.prisma.showEvent.findUnique({
      where: { id },
      include: {
        group: true,
        venue: true,
        dutyAssignments: {
          include: {
            assignedTalents: {
              include: {
                talent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    gender: true,
                    status: true,
                  },
                },
              },
            },
            overrides: {
              include: {
                originalTalent: {
                  select: { id: true, firstName: true, lastName: true },
                },
                replacementTalent: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!show) {
      throw new NotFoundException(`Show event with ID ${id} not found`);
    }

    return show;
  }

  async update(id: string, updateDto: UpdateScheduleDto) {
    const existing = await this.findOne(id);

    const candidate = {
      id,
      organizationId: existing.organizationId,
      groupId: updateDto.groupId || existing.groupId,
      hotelId: updateDto.hotelId || existing.hotelId,
      startDateTime: updateDto.startDateTime || existing.startDateTime,
      endDateTime: updateDto.endDateTime || existing.endDateTime,
      lobbyDateTime: updateDto.lobbyDateTime ?? existing.lobbyDateTime,
      lobbyTime: updateDto.lobbyTime ?? existing.lobbyTime,
    };

    const conflictResult = await this.conflictDetector.checkConflicts(candidate);
    if (conflictResult.hasConflict) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: 'Schedule conflict detected upon update',
          blockingConflicts: conflictResult.blockingConflicts,
          warningConflicts: conflictResult.warningConflicts,
        },
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.showEvent.update({
      where: { id },
      data: {
        ...(updateDto.groupId ? { groupId: updateDto.groupId } : {}),
        ...(updateDto.hotelId ? { hotelId: updateDto.hotelId } : {}),
        ...(updateDto.title ? { title: updateDto.title } : {}),
        ...(updateDto.startDateTime
          ? { startDateTime: new Date(updateDto.startDateTime) }
          : {}),
        ...(updateDto.endDateTime
          ? { endDateTime: new Date(updateDto.endDateTime) }
          : {}),
        ...(updateDto.lobbyDateTime !== undefined
          ? {
              lobbyDateTime: updateDto.lobbyDateTime
                ? new Date(updateDto.lobbyDateTime)
                : null,
            }
          : {}),
        ...(updateDto.lobbyTime !== undefined
          ? { lobbyTime: updateDto.lobbyTime }
          : {}),
        ...(updateDto.status ? { status: updateDto.status } : {}),
        ...(updateDto.notes !== undefined ? { notes: updateDto.notes } : {}),
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.showEvent.delete({ where: { id } });
  }

  async regenerateDuties(id: string) {
    await this.findOne(id);
    await this.rotationEngine.generateDutiesForShow(id);
    return this.findOne(id);
  }
}
