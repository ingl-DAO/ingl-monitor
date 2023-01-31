import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppSdk } from '../app.sdk';
import { MonitorController } from './monitor.controller';
import { ConnectionService, MonitorService } from './monitor.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [MonitorController],
  providers: [ConnectionService, AppSdk, MonitorService],
})
export class MonitorModule {}
