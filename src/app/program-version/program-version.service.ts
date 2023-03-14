import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, PublicKey } from '@solana/web3.js';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { BPF_LOADER_UPGRADEABLE_ID } from 'src/state';
import { tryPublicKey } from 'src/utils';
import { ProgramUsage } from '../program/program.schema';
import {
  BpfType,
  CreateProgramVersionDto,
  ProgramVersionQueryDto,
} from './program-version.dto';
import { ProgramVersion } from './program-version.schema';

@Injectable()
export class ProgramVersionService {
  constructor(
    private connection: Connection,
    @InjectModel(ProgramVersion.name)
    private programVersionModel: Model<ProgramVersion>
  ) {}

  async findAll(usage?: ProgramUsage): Promise<ProgramVersion[]> {
    return this.programVersionModel.find({ usage }).exec();
  }
  async findOne(filter: Partial<ProgramVersion>): Promise<ProgramVersion> {
    return this.programVersionModel.findOne(filter);
  }

  async findLastestVersion(usage: ProgramUsage): Promise<ProgramVersion> {
    const versions = await this.findAll(usage);
    return versions.sort((a, b) => a.version - b.version)[0];
  }

  async create({
    program_id,
    status,
    version,
    usage,
  }: CreateProgramVersionDto) {
    const programData = await this.connection.getAccountInfo(
      tryPublicKey(program_id)
    );
    const programDataHash = bcrypt.hashSync(
      programData.data.slice(37),
      Number(process.env.SALT)
    );
    return this.programVersionModel.create({
      usage,
      status,
      version,
      program_data_hash: programDataHash,
    });
  }

  async verify({
    bpfType,
    program_id,
    usage,
  }: ProgramVersionQueryDto): Promise<ProgramVersion | null> {
    try {
      let programDataAddress: PublicKey = tryPublicKey(program_id);
      if (bpfType === BpfType.Program) {
        [programDataAddress] = PublicKey.findProgramAddressSync(
          [tryPublicKey(program_id).toBuffer()],
          BPF_LOADER_UPGRADEABLE_ID
        );
      }
      const bufferAccountInfo = await this.connection.getAccountInfo(
        programDataAddress
      );
      if (!bufferAccountInfo.data) return null;
      //   pub enum UpgradeableLoaderState {
      //     Uninitialized,
      //     Buffer {
      //         authority_address: Option<Pubkey>,
      //        //prodram data here (37)
      //     },
      //     Program {
      //         programdata_address: Pubkey,
      //     },
      //     ProgramData {
      //         slot: u64,
      //         upgrade_authority_address: Option<Pubkey>,
      //        //prodram data here(44)
      //     },
      // }
      const dataHash = createHash('sha256')
        .update(
          bpfType === BpfType.Buffer
            ? bufferAccountInfo.data.slice(37)
            : bufferAccountInfo.data.slice(44)
        )
        .digest('hex');
      return this.findOne({ program_data_hash: dataHash, usage });
    } catch (error) {
      throw new HttpException(
        `Sorry, something went wrong. ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
