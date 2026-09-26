import { Module } from '@nestjs/common';
import { DutiesService } from './duties.service.js';
import { DutiesController } from './duties.controller.js';
import { RotationEngineService } from './rotation-engine.service.js';

@Module({
  controllers: [DutiesController],
  providers: [DutiesService, RotationEngineService],
  exports: [DutiesService, RotationEngineService],
})
export class DutiesModule {}

