import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('permissionless-address')
  getProgrmas() {
    return this.appService.getProgramId();
  }
  
  @Get(':program_id/use')
  useProgramId(@Param('program_id') programId: string) {
    return this.appService.useProgramId(programId);
  }
}
