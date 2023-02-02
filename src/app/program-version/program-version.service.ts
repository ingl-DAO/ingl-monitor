import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection } from '@solana/web3.js';
import { Model } from 'mongoose';
import { tryPublicKey } from 'src/utils';
import { ProgramVersion } from './program-version.schema';
import * as bcrypt from 'bcrypt';
import { CreateProgramVersionDto } from './program-version.dto';

@Injectable()
export class ProgramVersionService {
  constructor(
    private connection: Connection,
    @InjectModel(ProgramVersion.name)
    private programVersionModel: Model<ProgramVersion>
  ) {}

  async findAll(): Promise<ProgramVersion[]> {
    return this.programVersionModel.find().exec();
  }

  async create({ program_id, status, version }: CreateProgramVersionDto) {
    const programData = await this.connection.getAccountInfo(
      tryPublicKey(program_id)
    );
    const programDataHash = bcrypt.hashSync(
      programData.data.slice(37),
      process.env.SALT
    );
    return this.programVersionModel.create({
      status,
      version,
      program_data_hash: programDataHash,
    });
  }

  async verify(programId: string): Promise<ProgramVersion | null> {
    const programData = await this.connection.getAccountInfo(
      tryPublicKey(programId)
    );
    const programDataHash = bcrypt.hashSync(programData.data, process.env.SALT);
    const programVersion = await this.programVersionModel
      .findOne({
        program_data_hash: programDataHash.slice(37),
      })
      .exec();
    return programVersion;
  }
}
