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
import { InventoryService } from './inventory.service.js';
import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';
import { InventoryRequirementResponseDto } from './dto/inventory-response.dto.js';
import { FindInventoryQueryDto } from './dto/find-inventory-query.dto.js';
import { PinTalentDto } from './dto/pin-talent.dto.js';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a duty requirement or equipment task template' })
  @ApiResponse({
    status: 201,
    description: 'Requirement created successfully',
    type: InventoryRequirementResponseDto,
  })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List duty requirements filtered by group or organization' })
  @ApiResponse({
    status: 200,
    description: 'List of duty requirements',
    type: [InventoryRequirementResponseDto],
  })
  findAll(@Query() query: FindInventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get requirement details including pinned talents and sub-slots' })
  @ApiResponse({
    status: 200,
    description: 'Requirement details',
    type: InventoryRequirementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update requirement settings or talent pinning' })
  @ApiResponse({
    status: 200,
    description: 'Requirement updated successfully',
    type: InventoryRequirementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete requirement template' })
  @ApiResponse({ status: 200, description: 'Requirement deleted' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Post(':id/pin/:talentId')
  @ApiOperation({ summary: 'Pin a specific talent to this duty requirement (exclusive fixed or fairness sub-pool)' })
  @ApiResponse({ status: 200, description: 'Talent pinned successfully' })
  @ApiResponse({ status: 404, description: 'Requirement or talent not found' })
  pinTalent(
    @Param('id') requirementId: string,
    @Param('talentId') talentId: string,
    @Body() pinTalentDto?: PinTalentDto,
  ) {
    return this.inventoryService.pinTalent(requirementId, talentId, pinTalentDto);
  }

  @Delete(':id/pin/:talentId')
  @ApiOperation({ summary: 'Unpin a talent from this duty requirement' })
  @ApiResponse({ status: 200, description: 'Talent unpinned successfully' })
  @ApiResponse({ status: 404, description: 'Pinning record not found' })
  unpinTalent(
    @Param('id') requirementId: string,
    @Param('talentId') talentId: string,
  ) {
    return this.inventoryService.unpinTalent(requirementId, talentId);
  }
}
