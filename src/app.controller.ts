import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('program-list')
  getPrograms() {
    return this.appService.findPrograms();
  }

  @Get('program-id')
  async getProgramId() {
    return { program_id: await this.appService.findProgramId() };
  }

  @Get(':program_id/use')
  useProgramId(@Param('program_id') programId: string) {
    return this.appService.useProgramId(programId);
  }
}
