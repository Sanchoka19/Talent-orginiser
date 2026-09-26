import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVenueDto } from './dto/create-venue.dto.js';
import { UpdateVenueDto } from './dto/update-venue.dto.js';
import { FindVenuesQueryDto } from './dto/find-venues-query.dto.js';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateVenueDto) {
    return this.prisma.hotelVenue.create({
      data: {
        organizationId: createDto.organizationId,
        name: createDto.name,
        address: createDto.address,
        city: createDto.city,
        country: createDto.country,
        contactName: createDto.contactName,
        contactPhone: createDto.contactPhone,
        contactEmail: createDto.contactEmail,
        roomOrBallroom: createDto.roomOrBallroom,
        travelTimeMinutes: createDto.travelTimeMinutes ?? 0,
        photoUrl: createDto.photoUrl,
        notes: createDto.notes,
      },
    });
  }

  async findAll(query?: FindVenuesQueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    return this.prisma.hotelVenue.findMany({
      where: {
        ...(query?.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query?.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { city: { contains: query.search, mode: 'insensitive' } },
                { address: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { shows: true },
        },
      },
      skip,
      take: limit,
      orderBy: { name: query?.sortOrder || 'asc' },
    });
  }

  async findOne(id: string) {
    const venue = await this.prisma.hotelVenue.findUnique({
      where: { id },
      include: {
        shows: {
          where: { startDateTime: { gte: new Date() } },
          include: {
            group: { select: { id: true, name: true, colorAccent: true } },
          },
          orderBy: { startDateTime: 'asc' },
          take: 10,
        },
        _count: {
          select: { shows: true },
        },
      },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  async update(id: string, updateDto: UpdateVenueDto) {
    await this.findOne(id);

    return this.prisma.hotelVenue.update({
      where: { id },
      data: {
        ...(updateDto.name ? { name: updateDto.name } : {}),
        ...(updateDto.address ? { address: updateDto.address } : {}),
        ...(updateDto.city ? { city: updateDto.city } : {}),
        ...(updateDto.country ? { country: updateDto.country } : {}),
        ...(updateDto.contactName ? { contactName: updateDto.contactName } : {}),
        ...(updateDto.contactPhone ? { contactPhone: updateDto.contactPhone } : {}),
        ...(updateDto.contactEmail ? { contactEmail: updateDto.contactEmail } : {}),
        ...(updateDto.roomOrBallroom !== undefined
          ? { roomOrBallroom: updateDto.roomOrBallroom }
          : {}),
        ...(updateDto.travelTimeMinutes !== undefined
          ? { travelTimeMinutes: updateDto.travelTimeMinutes }
          : {}),
        ...(updateDto.photoUrl !== undefined ? { photoUrl: updateDto.photoUrl } : {}),
        ...(updateDto.notes !== undefined ? { notes: updateDto.notes } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hotelVenue.delete({ where: { id } });
  }
}
