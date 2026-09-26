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
import { TalentsService } from './talents.service.js';
import { CreateTalentDto } from './dto/create-talent.dto.js';
import { UpdateTalentDto } from './dto/update-talent.dto.js';
import { CreateContractRecordDto } from './dto/create-contract.dto.js';
import { FindTalentsQueryDto } from './dto/find-talents-query.dto.js';
import { FindDossiersQueryDto } from './dto/find-dossiers-query.dto.js';
import { TalentResponseDto } from './dto/talent-response.dto.js';
import { ContractRecordResponseDto } from './dto/contract-response.dto.js';

@ApiTags('talents')
@Controller('talents')
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new talent / performer to the roster' })
  @ApiResponse({ status: 201, description: 'Talent created successfully', type: TalentResponseDto })
  create(@Body() createTalentDto: CreateTalentDto) {
    return this.talentsService.create(createTalentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all talents with optional status and search filters' })
  @ApiResponse({ status: 200, description: 'List of talents', type: [TalentResponseDto] })
  findAll(@Query() query: FindTalentsQueryDto) {
    return this.talentsService.findAll(query);
  }

  @Get('archive/dossiers')
  @ApiOperation({ summary: 'Retrieve archive contract dossiers and seasonal evaluations' })
  @ApiResponse({ status: 200, description: 'List of contract dossiers', type: [ContractRecordResponseDto] })
  getArchiveDossiers(@Query() query: FindDossiersQueryDto) {
    return this.talentsService.getArchiveDossiers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complete talent profile by ID including contracts and documents' })
  @ApiResponse({ status: 200, description: 'Talent profile details', type: TalentResponseDto })
  @ApiResponse({ status: 404, description: 'Talent not found' })
  findOne(@Param('id') id: string) {
    return this.talentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update talent profile' })
  @ApiResponse({ status: 200, description: 'Talent successfully updated', type: TalentResponseDto })
  update(@Param('id') id: string, @Body() updateTalentDto: UpdateTalentDto) {
    return this.talentsService.update(id, updateTalentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a talent record' })
  @ApiResponse({ status: 200, description: 'Talent record deleted' })
  remove(@Param('id') id: string) {
    return this.talentsService.remove(id);
  }

  @Post(':id/contracts')
  @ApiOperation({ summary: 'Add a seasonal contract evaluation / review to talent dossier' })
  @ApiResponse({ status: 201, description: 'Contract review added', type: ContractRecordResponseDto })
  addContractRecord(
    @Param('id') talentId: string,
    @Body() contractDto: CreateContractRecordDto,
  ) {
    return this.talentsService.addContractRecord(talentId, contractDto);
  }
}
