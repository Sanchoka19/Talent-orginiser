import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleCountDto {
  @ApiProperty({ example: 4 })
  users: number;
}

export class RoleResponseDto {
  @ApiProperty({ example: 'rol_clh4z8x0100003b60klnj5u2c' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'management' })
  key: string;

  @ApiProperty({ example: 'Management' })
  title: string;

  @ApiProperty({ example: 'მენეჯმენტი' })
  badge: string;

  @ApiProperty({ example: '#0891B2' })
  badgeColor: string;

  @ApiPropertyOptional({ example: 'Show planning and talent controls' })
  description?: string | null;

  @ApiProperty({ type: [String], example: ['talents:view', 'schedule:book'] })
  permissions: string[];

  @ApiProperty({ example: true })
  isSystem: boolean;

  @ApiPropertyOptional({ type: RoleCountDto })
  _count?: RoleCountDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
