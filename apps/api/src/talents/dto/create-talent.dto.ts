import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTalentDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'First name', example: 'Amélie' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Laurent' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address', example: 'amelie.laurent@artistent.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+33 6 12 34 56 78' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE'], example: 'FEMALE' })
  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @ApiProperty({ description: 'Height in cm', example: 168 })
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm: number;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 54 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(200)
  weightKg?: number;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'REST', 'SICK_INJURED', 'TERMINATED'], default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'REST', 'SICK_INJURED', 'TERMINATED'])
  status?: 'ACTIVE' | 'REST' | 'SICK_INJURED' | 'TERMINATED';

  @ApiProperty({ description: 'Primary performance skill', example: 'Aerialist & Silk Performer' })
  @IsNotEmpty()
  @IsString()
  primarySkill: string;

  @ApiPropertyOptional({ description: 'Secondary skills', example: ['Contortion', 'Lyrical Dance'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondarySkills?: string[];

  @ApiPropertyOptional({ description: 'Avatar image URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Internal talent notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'], default: 'ELIGIBLE' })
  @IsOptional()
  @IsEnum(['ELIGIBLE', 'NEUTRAL', 'DO_NOT_REHIRE', 'UNDER_REVIEW'])
  rehireStatus?: 'ELIGIBLE' | 'NEUTRAL' | 'DO_NOT_REHIRE' | 'UNDER_REVIEW';

  @ApiPropertyOptional({ description: 'Contract expiration date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  contractExpiryDate?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'], default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(['ACTIVE', 'COMPLETED', 'TERMINATED'])
  contractStatus?: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

  @ApiPropertyOptional({ description: 'Whether talent record is archived', default: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({ description: 'Reason for contract termination' })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiPropertyOptional({ description: 'Termination date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}
