import { Controller, Get, Query } from '@nestjs/common';
import { ProgramVersionService } from './program-version.service';

@Controller('program-versions')
export class ProgramVersionController {
  constructor(private programVersionService: ProgramVersionService) {}

  @Get('all')
  async findPrograms() {
    return this.programVersionService.findAll();
  }

  @Get('verify')
  async verifyProgram(@Query('program_id') programId: string) {
    return this.programVersionService.verify(programId);
  }
}
