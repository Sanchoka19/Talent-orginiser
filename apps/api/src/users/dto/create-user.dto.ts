import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'User corporate email address', example: 'admin@artistent.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User full name', example: 'Sandro Chokoraia' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional({ description: 'Contact phone number', example: '+995 599 12 34 56' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Assigned role ID' })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Profile avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INVITED', 'SUSPENDED'], default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INVITED', 'SUSPENDED'])
  status?: 'ACTIVE' | 'INVITED' | 'SUSPENDED';

  @ApiPropertyOptional({ description: 'Initial account password (will be hashed)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
