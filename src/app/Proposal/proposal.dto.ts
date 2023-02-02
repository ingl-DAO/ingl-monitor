import { Type } from 'class-transformer';
import {
  IsBase58,
  IsEnum,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export enum ConfigAccountEnum {
  MaxPrimaryStake = 'MaxPrimaryStake',
  NftHolderShare = 'NftHolderShare',
  InitialRedemptionFee = 'InitialRedemptionFee',
  RedemptionFeeDuration = 'RedemptionFeeDuration',
  ValidatorName = 'ValidatorName',
  TwitterHandle = 'TwitterHandle',
  DiscordInvite = 'DiscordInvite',
}

export class ConfigAccount {
  @IsEnum(ConfigAccountEnum)
  config_type: ConfigAccountEnum;

  @IsString()
  value: string;
}

export class ProgramUpgrade {
  @IsBase58()
  buffer_account: string;

  @IsUrl()
  code_link: string;
}

export enum VoteAccountEnum {
  ValidatorID = 'ValidatorID',
  Commission = 'Commission',
}
export class VoteAccount {
  @IsEnum(VoteAccountEnum)
  vote_type: VoteAccountEnum;

  @IsString()
  value: string;
}

export class Saveguards {
  @IsBase58()
  nft_mint_id: string;

  @IsBase58()
  associated_token_id: string;
}

export class CreateProposalDto {
  @IsString()
  title: string;

  @IsBase58()
  program_id: string;

  @IsString()
  description: string;

  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => Saveguards)
  safeguards: Saveguards;

  @IsOptional()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ConfigAccount)
  configAccount?: ConfigAccount;

  @IsOptional()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ProgramUpgrade)
  programUpgrade?: ProgramUpgrade;

  @IsOptional()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => VoteAccount)
  voteAccount?: VoteAccount;
}
