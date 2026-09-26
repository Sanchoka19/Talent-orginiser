import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { SchedulesController } from './schedules.controller.js';
import { ConflictDetectorService } from './conflict-detector.service.js';
import { DutiesModule } from '../duties/duties.module.js';

@Module({
  imports: [DutiesModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, ConflictDetectorService],
  exports: [SchedulesService, ConflictDetectorService],
})
export class SchedulesModule {}

