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
import { Keypair, Transaction } from '@solana/web3.js';
import { tryPublicKey } from 'src/utils';
import { QueryDto, RegisterValidatorDto, UploadUrisDto } from './program.dto';
import { ProgramService } from './program.service';

@Controller('programs')
export class ProgramController {
  constructor(private programService: ProgramService) {}

  @Get()
  async getPrograms(@Query('is_used') is_used: boolean) {
    return this.programService.findPrograms({ is_used: is_used ?? false });
  }

  @Get('available')
  async getProgram(@Query() { usage }: QueryDto) {
    return {
      program_id: (await this.programService.findProgram(usage)).program_id,
    };
  }

  @Put(':program_id/use')
  useProgramId(@Param('program_id') programId: string) {
    return this.programService.useProgramId(programId);
  }

  @Post('new-validator')
  async createRegisterValidatorTrans(
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
    try {
      return this.programService.createRegisterValidatorTrans(newValidator);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':program_id/upload-uris')
  async createUploadRaritiesUrisTrans(
    @Param('program_id') programId: string,
    @Body() { payer_id, rarities }: UploadUrisDto
  ) {
    try {
      return this.programService.createUploadRaritiesUrisTrans(
        tryPublicKey(programId),
        tryPublicKey(payer_id),
        rarities
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sign-transaction')
  async signTransaction(@Body() serializedTransaction: Buffer) {
    const transaction = Transaction.from(serializedTransaction);
    const keypairBuffer = Buffer.from(
      JSON.parse(process.env.BACKEND_KEYPAIR as string)
    );
    const backendKeypair = Keypair.fromSecretKey(keypairBuffer);
    transaction.sign(backendKeypair);
    return transaction;
  }
}
