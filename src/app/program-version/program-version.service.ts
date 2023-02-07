import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection } from '@solana/web3.js';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { tryPublicKey } from 'src/utils';
import { CreateProgramVersionDto } from './program-version.dto';
import { ProgramVersion } from './program-version.schema';
// import { deserialize } from '@dao-xyz/borsh';
// import {
//   BufferState,
//   UpgradeableLoaderState,
// } from 'src/state/instruction/upgrade';

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

  async findLastestVersion(): Promise<ProgramVersion> {
    const versions = await this.findAll();
    return versions.sort((a, b) => a.version - b.version)[0];
  }

  async create({ program_id, status, version }: CreateProgramVersionDto) {
    const programData = await this.connection.getAccountInfo(
      tryPublicKey(program_id)
    );
    const programDataHash = bcrypt.hashSync(
      programData.data.slice(37),
      Number(process.env.SALT)
    );
    return this.programVersionModel.create({
      status,
      version,
      program_data_hash: programDataHash,
    });
  }

  async verify(bufferId: string): Promise<ProgramVersion | null> {
    const bufferAccountInfo = await this.connection.getAccountInfo(
      tryPublicKey(bufferId)
    );
    if (!bufferAccountInfo.data) return null;
    // const bufferData = deserialize(
    //   bufferAccountInfo.data,
    //   UpgradeableLoaderState,
    //   { unchecked: false }
    // );
    // console.log(bufferData)
    // if (!(bufferData instanceof BufferState))
    //   throw new HttpException(
    //     `The account type must be a buffer, a delineation exists between the sent type and the expected type.`,
    //     HttpStatus.EXPECTATION_FAILED
    //   );
    const programVersions = await this.findAll();
    return programVersions.find((programVersion) =>
      bcrypt.compareSync(
        bufferAccountInfo.data.slice(37),
        programVersion.program_data_hash
      )
    );
  }
}
