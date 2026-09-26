import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VenueCountDto {
  @ApiProperty({ example: 6 })
  shows: number;
}

export class VenueResponseDto {
  @ApiProperty({ example: 'ven-1' })
  id: string;

  @ApiProperty({ example: 'org-default' })
  organizationId: string;

  @ApiProperty({ example: 'The Venetian Resort & Casino' })
  name: string;

  @ApiProperty({ example: '3355 S Las Vegas Blvd' })
  address: string;

  @ApiProperty({ example: 'Las Vegas' })
  city: string;

  @ApiProperty({ example: 'United States' })
  country: string;

  @ApiProperty({ example: 'Victoria Sterling' })
  contactName: string;

  @ApiProperty({ example: '+1 (702) 555-0192' })
  contactPhone: string;

  @ApiProperty({ example: 'vsterling@venetianlv.com' })
  contactEmail: string;

  @ApiPropertyOptional({ example: 'Palazzo Grand Stage' })
  roomOrBallroom?: string | null;

  @ApiProperty({ example: 45 })
  travelTimeMinutes: number;

  @ApiPropertyOptional()
  photoUrl?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional({ type: VenueCountDto })
  _count?: VenueCountDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
