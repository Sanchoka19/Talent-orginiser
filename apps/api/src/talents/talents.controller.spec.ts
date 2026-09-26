import { Test, TestingModule } from '@nestjs/testing';
import { TalentsController } from './talents.controller.js';
import { TalentsService } from './talents.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createMockPrismaService } from '../../test/mock-prisma.service.js';

describe('TalentsController', () => {
  let controller: TalentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TalentsController],
      providers: [
        TalentsService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    controller = module.get<TalentsController>(TalentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
