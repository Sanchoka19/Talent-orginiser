import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service.js';
import { ConflictDetectorService } from './conflict-detector.service.js';
import { RotationEngineService } from '../duties/rotation-engine.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createMockPrismaService } from '../../test/mock-prisma.service.js';
import { vi } from 'vitest';

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
        {
          provide: ConflictDetectorService,
          useValue: {
            checkConflicts: vi.fn().mockResolvedValue({
              hasConflict: false,
              blockingConflicts: [],
              warningConflicts: [],
            }),
          },
        },
        {
          provide: RotationEngineService,
          useValue: {
            generateDutiesForShow: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
