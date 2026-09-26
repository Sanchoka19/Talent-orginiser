import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesController } from './schedules.controller.js';
import { SchedulesService } from './schedules.service.js';
import { ConflictDetectorService } from './conflict-detector.service.js';
import { RotationEngineService } from '../duties/rotation-engine.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createMockPrismaService } from '../../test/mock-prisma.service.js';
import { vi } from 'vitest';

describe('SchedulesController', () => {
  let controller: SchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
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

    controller = module.get<SchedulesController>(SchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
