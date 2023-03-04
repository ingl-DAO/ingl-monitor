import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProgramUsage } from '../../program/program.schema';
import { BetaAccess } from './beta-access.schema';

@Injectable()
export class BetaAccessService {
  constructor(
    @InjectModel(BetaAccess.name)
    private programVersionModel: Model<BetaAccess>
  ) {}

  async getAccess(
    usage: ProgramUsage,
    accessCode: string
  ): Promise<BetaAccess> {
    return this.programVersionModel.findOne({
      accessCode,
      usage,
    });
  }

  async findOne(baseUrl: string): Promise<BetaAccess | null> {
    return this.programVersionModel.findOne({
      baseUrl,
    });
  }
}
