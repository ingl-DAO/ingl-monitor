import {
  Body, Controller,
  Get, HttpException, HttpStatus, Post,
  Query
} from '@nestjs/common';
import { CreateProgramVersionDto } from './program-version.dto';
import { ProgramVersionService } from './program-version.service';

@Controller('program-versions')
export class ProgramVersionController {
  constructor(private programVersionService: ProgramVersionService) {}

  @Get('all')
  async findProgramVersions() {
    return this.programVersionService.findAll();
  }
  @Get('latest')
  async findLatestProgramVersion() {
    return this.programVersionService.findLastestVersion();
  }

  @Get('verify')
  async verifyProgram(@Query('program_id') programId: string) {
    return this.programVersionService.verify(programId);
  }

  @Post('new')
  async addNewVersion(@Body() newVersion: CreateProgramVersionDto) {
    try {
      return this.programVersionService.create(newVersion);
    } catch (error) {
      throw new HttpException(
        `Error occured when addind a new program version: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
