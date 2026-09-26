import { Test, TestingModule } from '@nestjs/testing';
import { DutiesService } from './duties.service.js';
import { RotationEngineService } from './rotation-engine.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createMockPrismaService } from '../../test/mock-prisma.service.js';
import { vi } from 'vitest';

describe('DutiesService', () => {
  let service: DutiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DutiesService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
        {
          provide: RotationEngineService,
          useValue: {
            swapDutyTalent: vi.fn().mockResolvedValue(undefined),
            getHistoricalDutyCounts: vi.fn().mockResolvedValue(new Map()),
            computeFairnessScore: vi.fn().mockReturnValue(100),
            getCycleKey: vi.fn().mockReturnValue('2026-C0_W1'),
          },
        },
      ],
    }).compile();

    service = module.get<DutiesService>(DutiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
