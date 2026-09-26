import { Test, TestingModule } from '@nestjs/testing';
import { DutiesController } from './duties.controller.js';
import { DutiesService } from './duties.service.js';
import { RotationEngineService } from './rotation-engine.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createMockPrismaService } from '../../test/mock-prisma.service.js';
import { vi } from 'vitest';

describe('DutiesController', () => {
  let controller: DutiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DutiesController],
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

    controller = module.get<DutiesController>(DutiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
