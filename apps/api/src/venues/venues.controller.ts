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
import { VenuesService } from './venues.service.js';
import { CreateVenueDto } from './dto/create-venue.dto.js';
import { UpdateVenueDto } from './dto/update-venue.dto.js';
import { VenueResponseDto } from './dto/venue-response.dto.js';
import { FindVenuesQueryDto } from './dto/find-venues-query.dto.js';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new hotel, resort or arena venue' })
  @ApiResponse({ status: 201, description: 'Venue registered successfully', type: VenueResponseDto })
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all venues in workspace with search and pagination' })
  @ApiResponse({ status: 200, description: 'List of venues', type: [VenueResponseDto] })
  findAll(@Query() query: FindVenuesQueryDto) {
    return this.venuesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue details with upcoming scheduled shows' })
  @ApiResponse({ status: 200, description: 'Venue details', type: VenueResponseDto })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update venue information' })
  @ApiResponse({ status: 200, description: 'Venue updated', type: VenueResponseDto })
  update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    return this.venuesService.update(id, updateVenueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a venue record' })
  @ApiResponse({ status: 200, description: 'Venue deleted' })
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
