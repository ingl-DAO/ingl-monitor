import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProgramUsage } from '../../program/program.schema';

export type ProgramDocument = HydratedDocument<BetaAccess>;

@Schema({
  collection: 'ingl_beta_access',
})
export class BetaAccess {
  @Prop({
    type: String,
    required: true,
  })
  accessCode: string;

  @Prop({
    enum: ProgramUsage,
    required: true,
  })
  usage: ProgramUsage;

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  baseUrl: string;

  @Prop({
    type: String,
    required: true,
    default: 'http://localhost:4200',
  })
  localUrl: string;
}

export const ProgramVersionSchema = SchemaFactory.createForClass(BetaAccess);
