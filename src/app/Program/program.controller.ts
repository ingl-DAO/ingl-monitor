import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RegisterValidatorDto } from './program.dto';
import { ProgramService } from './program.service';

@Controller('programs')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Get()
  async getPrograms(@Query('is_used') is_used: boolean) {
    return this.programService.findPrograms({ is_used: is_used ?? false });
  }

  @Get('available')
  async getProgram() {
    return { program_id: await this.programService.findProgram() };
  }

  @Put(':program_id/use')
  useProgramId(@Param('program_id') programId: string) {
    return this.programService.useProgramId(programId);
  }

  @Post('new-validator')
  async registerNewValidator(
    @Body()
    newValidator: RegisterValidatorDto
  ) {
    const {
      rarities,
      rarity_names,
      unit_backing,
      max_primary_stake,
      initial_redemption_fee,
      is_validator_id_switchable,
    } = newValidator;
    if (!is_validator_id_switchable && initial_redemption_fee !== 0)
      throw new HttpException(
        'Validator id must be switchable if there exists any redemption fee',
        HttpStatus.BAD_REQUEST
      );
    if (max_primary_stake < unit_backing)
      throw new HttpException(
        'Max primary stake must be greater unit backing.',
        HttpStatus.BAD_REQUEST
      );
    if (rarities.length !== rarity_names.length)
      throw new HttpException(
        'Rarity names array length must be equal to rarities array length',
        HttpStatus.BAD_REQUEST
      );
    if (rarities.reduce((total, rarity) => total + rarity.rarity, 0) !== 10_000)
      throw new HttpException(
        'Rarities must sum to 10000',
        HttpStatus.BAD_REQUEST
      );
    return this.programService.registerValidator(newValidator);
  }
}
