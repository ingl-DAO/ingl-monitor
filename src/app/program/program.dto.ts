import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBase58,
  IsBoolean,
  IsEnum, IsNumber,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';
import { ProgramUsage } from './program.schema';

export class Rarity {
  @IsNumber()
  rarity: number;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => URL)
  @IsString({ each: true })
  uris: string[];
}

export class UploadUrisDto {
  @IsBase58()
  payer_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Rarity)
  @ValidateNested({ each: true })
  rarities: Rarity[];
}

export class AccountMetaDto {
  @IsBase58()
  pubkey: string;

  @IsBoolean()
  isSigner: boolean;

  @IsBoolean()
  isWritable: boolean;
}
export class RegisterValidatorDto extends UploadUrisDto {
  @IsBase58()
  payer_id: string;

  @IsBase58()
  program_id: string;

  @IsBoolean()
  has_vote_account: boolean;

  @Min(65)
  @Max(100)
  @IsNumber()
  proposal_quorum: number;

  @Min(0)
  @Max(100)
  @Min(0)
  @IsNumber()
  init_commission: number; //in percentage

  @Min(1.03)
  @IsNumber()
  max_primary_stake: number; //in sol (big number)

  @Min(0)
  @Max(25)
  @IsNumber()
  initial_redemption_fee: number;

  @IsBoolean()
  is_validator_id_switchable: boolean;

  @Min(1.03)
  @IsNumber()
  unit_backing: number; //big number

  @Min(0)
  @IsNumber()
  @Max(2 * 365 * 24 * 3600)
  redemption_fee_duration: number;

  @Max(2)
  @Min(0)
  @IsNumber()
  creator_royalties: number;

  @IsString()
  @MaxLength(32)
  validator_name: string;

  @IsUrl()
  collection_uri: string;

  @Min(50)
  @Max(100)
  @IsNumber()
  nft_holders_share: number;

  @IsUrl()
  @MaxLength(64)
  website: string;

  @IsNumber()
  @Max(1 * 365 * 24 * 3600)
  governance_expiration_time: number;

  @IsUrl()
  @MaxLength(75)
  default_uri: string;

  @MaxLength(32)
  twitter_handle: string;

  @IsUrl()
  @MaxLength(32)
  discord_invite: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  rarity_names: string[];

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => AccountMetaDto)
  accounts: AccountMetaDto[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  lookupTableAddresses: string[];
}

export class QueryDto {
  @IsEnum(ProgramUsage)
  usage: ProgramUsage;
}
