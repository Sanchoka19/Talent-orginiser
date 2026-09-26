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
import { GroupsService } from './groups.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { GroupResponseDto, AddMemberDto } from './dto/group-response.dto.js';
import { FindGroupsQueryDto } from './dto/find-groups-query.dto.js';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new troupe or cast group' })
  @ApiResponse({ status: 201, description: 'Group created successfully', type: GroupResponseDto })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all groups in workspace with member rosters' })
  @ApiResponse({ status: 200, description: 'List of groups', type: [GroupResponseDto] })
  findAll(@Query() query: FindGroupsQueryDto) {
    return this.groupsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get troupe details by ID including members and requirements' })
  @ApiResponse({ status: 200, description: 'Group details', type: GroupResponseDto })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group configuration or roster' })
  @ApiResponse({ status: 200, description: 'Group updated successfully', type: GroupResponseDto })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete group and its member relations' })
  @ApiResponse({ status: 200, description: 'Group deleted' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/members/:talentId')
  @ApiOperation({ summary: 'Enroll a performer into the group' })
  @ApiResponse({ status: 201, description: 'Performer enrolled into troupe' })
  addMember(
    @Param('id') groupId: string,
    @Param('talentId') talentId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.groupsService.addMember(groupId, talentId, addMemberDto?.roleNote);
  }

  @Delete(':id/members/:talentId')
  @ApiOperation({ summary: 'Remove a performer from the group' })
  @ApiResponse({ status: 200, description: 'Performer removed from troupe' })
  removeMember(
    @Param('id') groupId: string,
    @Param('talentId') talentId: string,
  ) {
    return this.groupsService.removeMember(groupId, talentId);
  }
}
