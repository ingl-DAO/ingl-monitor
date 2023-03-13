import {
  Controller,
  Get, Query
} from '@nestjs/common';
import { ProgramUsage } from '../program/program.schema';
import {
  ProgramVersionQueryDto
} from './program-version.dto';
import { ProgramVersionService } from './program-version.service';

@Controller('program-versions')
export class ProgramVersionController {
  constructor(private programVersionService: ProgramVersionService) {}

  @Get('all')
  async findProgramVersions() {
    return this.programVersionService.findAll();
  }
  @Get('latest')
  async findLatestProgramVersion(@Query('usage') usage: ProgramUsage) {
    return this.programVersionService.findLastestVersion(usage);
  }

  @Get('verify')
  async verifyProgram(@Query() query: ProgramVersionQueryDto) {
    return this.programVersionService.verify(query);
  }

  // @Post('new')
  // async addNewVersion(@Body() newVersion: CreateProgramVersionDto) {
  //   try {
  //     return await this.programVersionService.create(newVersion);
  //   } catch (error) {
  //     throw new HttpException(
  //       `Error occured when addind a new program version: ${error.message}`,
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
}
