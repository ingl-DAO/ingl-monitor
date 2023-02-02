import { IsBase58, IsEnum, IsNumber } from 'class-validator';

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
}
