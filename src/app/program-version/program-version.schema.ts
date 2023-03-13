import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProgramUsage } from '../program/program.schema';
import { VersionStatus } from './program-version.dto';

export type ProgramDocument = HydratedDocument<ProgramVersion>;

@Schema({
  collection: 'program_versions',
})
export class ProgramVersion {
  @Prop({
    type: String,
    required: true,
  })
  program_data_hash: string;

  @Prop({
    type: Number,
    required: true,
  })
  version: number;

  @Prop({
    required: true,
    enum: VersionStatus,
  })
  status: VersionStatus;

  @Prop({
    required: true,
    enum: ProgramUsage,
  })
  usage: ProgramUsage;

  @Prop({
    type: Date,
    required: true,
    default: new Date(),
  })
  released_on: Date;
}

export const ProgramVersionSchema =
  SchemaFactory.createForClass(ProgramVersion);
