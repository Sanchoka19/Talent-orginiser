import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { ScheduleResponseDto } from './dto/schedule-response.dto.js';
import { FindSchedulesQueryDto } from './dto/find-schedules-query.dto.js';
import { ConflictResponseDto } from '../common/dto/conflict-response.dto.js';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new show event with conflict detection and auto-duty allocation' })
  @ApiResponse({ status: 201, description: 'Show event successfully created', type: ScheduleResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict detected', type: ConflictResponseDto })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'List scheduled show events with date range and troupe filters' })
  @ApiResponse({ status: 200, description: 'List of show events', type: [ScheduleResponseDto] })
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a show event by ID including duty assignments' })
  @ApiResponse({ status: 200, description: 'Show event details', type: ScheduleResponseDto })
  @ApiResponse({ status: 404, description: 'Show event not found' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a show event' })
  @ApiResponse({ status: 200, description: 'Show event updated', type: ScheduleResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict detected upon update', type: ConflictResponseDto })
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a show event' })
  @ApiResponse({ status: 200, description: 'Show event deleted' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }

  @Post(':id/regenerate-duties')
  @ApiOperation({ summary: 'Regenerate fair duty assignments for this show' })
  @ApiResponse({ status: 200, description: 'Duties regenerated', type: ScheduleResponseDto })
  regenerateDuties(@Param('id') id: string) {
    return this.schedulesService.regenerateDuties(id);
  }
}
