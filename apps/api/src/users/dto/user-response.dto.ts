import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  badge: string;

  @ApiProperty()
  badgeColor: string;

  @ApiProperty({ type: [String] })
  permissions: string[];
}

export class UserResponseDto {
  @ApiProperty({ example: 'usr_clh4z8x0100003b60klnj5u2c' })
  id: string;

  @ApiProperty({ example: 'org_default' })
  organizationId: string;

  @ApiProperty({ example: 'admin@artistent.com' })
  email: string;

  @ApiProperty({ example: 'Sandro Chokoraia' })
  fullName: string;

  @ApiPropertyOptional({ example: '+995 599 12 34 56' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  avatarUrl?: string | null;

  @ApiProperty({ enum: ['ACTIVE', 'INVITED', 'SUSPENDED'], example: 'ACTIVE' })
  status: string;

  @ApiPropertyOptional()
  roleId?: string | null;

  @ApiPropertyOptional({ type: () => RoleSummaryDto })
  role?: RoleSummaryDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
