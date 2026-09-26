import { Module } from '@nestjs/common';
import { TalentsService } from './talents.service.js';
import { TalentsController } from './talents.controller.js';

@Module({
  controllers: [TalentsController],
  providers: [TalentsService],
})
export class TalentsModule {}
