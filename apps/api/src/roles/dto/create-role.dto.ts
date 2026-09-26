import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Unique role machine key', example: 'management' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9_]+$/, { message: 'Role key must contain only lowercase alphanumeric characters and underscores' })
  key: string;

  @ApiProperty({ description: 'Role display title', example: 'Management' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Badge display label', example: 'მენეჯმენტი' })
  @IsNotEmpty()
  @IsString()
  badge: string;

  @ApiPropertyOptional({ description: 'Badge hex color', default: '#0891B2', example: '#0891B2' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Badge color must be a valid 6-character hex code (e.g. #0891B2)' })
  badgeColor?: string;

  @ApiPropertyOptional({ description: 'Role description and authority scope' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of granted permission keys',
    example: ['talents:view', 'talents:edit', 'schedule:view', 'schedule:book', 'groups:manage', 'duty:override'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @ApiPropertyOptional({ description: 'Whether this is a built-in immutable system role', default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
