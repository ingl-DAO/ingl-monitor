import { IsBase58, IsEnum, IsNumber } from 'class-validator';
import { ProgramUsage } from '../program/program.schema';

export enum VersionStatus {
  Deprecated = 'Deprecated',
  Unsafe = 'Unsafe',
  Safe = 'Safe',
}

export class CreateProgramVersionDto {
  @IsBase58()
  program_id: string;

  @IsNumber()
  version: number;

  @IsEnum(VersionStatus)
  status: VersionStatus;

  @IsEnum(ProgramUsage)
  usage: ProgramUsage;
}

export enum BpfType {
  Buffer = 'Buffer',
  Program = 'Program',
}

export class ProgramVersionQueryDto {
  @IsEnum(ProgramUsage)
  usage: ProgramUsage;

  @IsBase58()
  program_id: string;

  @IsEnum(BpfType)
  account_type: BpfType;
}
