import { Test, TestingModule } from '@nestjs/testing';
import { TalentsService } from './talents.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createMockPrismaService } from '../../test/mock-prisma.service.js';

describe('TalentsService', () => {
  let service: TalentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TalentsService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<TalentsService>(TalentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
