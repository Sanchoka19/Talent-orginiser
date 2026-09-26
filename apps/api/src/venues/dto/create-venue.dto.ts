import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ description: 'Workspace organization ID', example: 'org-default' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Hotel or arena venue name', example: 'The Venetian Resort & Casino' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Physical street address', example: '3355 S Las Vegas Blvd' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'City name', example: 'Las Vegas' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Country', example: 'United States' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ description: 'Venue coordinator contact name', example: 'Victoria Sterling' })
  @IsNotEmpty()
  @IsString()
  contactName: string;

  @ApiProperty({ description: 'Contact phone number', example: '+1 (702) 555-0192' })
  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @ApiProperty({ description: 'Contact email', example: 'vsterling@venetianlv.com' })
  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({ description: 'Room, stage or ballroom identifier', example: 'Palazzo Ballroom Stage 2' })
  @IsOptional()
  @IsString()
  roomOrBallroom?: string;

  @ApiPropertyOptional({ description: 'Estimated travel time from artist lodge in minutes', example: 45 })
  @IsOptional()
  @IsInt()
  @Min(0)
  travelTimeMinutes?: number;

  @ApiPropertyOptional({ description: 'Venue photo URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Technical notes: ceiling height, loading dock bay, lighting rig' })
  @IsOptional()
  @IsString()
  notes?: string;
}
