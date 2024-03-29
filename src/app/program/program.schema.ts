import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProgramDocument = HydratedDocument<Program>;

export enum ProgramUsage {
  Marketplace = 'Marketplace',
  PermissionlessValidator = 'PermissionlessValidator',
}

@Schema({
  collection: 'program_list',
})
export class Program {
  @Prop({
    type: String,
    required: true,
  })
  program_id: string;

  @Prop({
    required: true,
    enum: ProgramUsage,
    default: ProgramUsage.PermissionlessValidator,
  })
  usage: ProgramUsage;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  is_used: boolean;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);
