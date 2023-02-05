import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProgramDocument = HydratedDocument<Program>;

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
    type: Boolean,
    required: true,
    default: true,
  })
  is_used: boolean;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);