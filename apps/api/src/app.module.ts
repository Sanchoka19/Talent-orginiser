import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TalentsModule } from './talents/talents.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { VenuesModule } from './venues/venues.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { DutiesModule } from './duties/duties.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [TalentsModule, GroupsModule, VenuesModule, SchedulesModule, DutiesModule, InventoryModule, UsersModule, RolesModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
