import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBase58,
  IsBoolean,
  IsNumber,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RegisterValidatorDto {
  @IsBase58()
  validator_id: string;

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
  @Length(32)
  validator_name: string;

  @IsUrl()
  collection_uri: string;

  @Min(50)
  @Max(100)
  @IsNumber()
  nft_holders_share: number;

  @IsUrl()
  @Length(64)
  website: string;

  @IsNumber()
  @Max(1 * 365 * 24 * 3600)
  governance_expiration_time: number;

  @IsUrl()
  @Length(75)
  default_uri: string;

  @IsUrl()
  @Length(32)
  twitter_handle: string;

  @IsUrl()
  @Length(32)
  discord_invite: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Rarity)
  @ValidateNested({ each: true })
  rarities: Rarity[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  rarity_names: string[];
}

export class Rarity {
  @IsNumber()
  rarity: number;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => URL)
  @IsString({ each: true })
  uris: string[];
}
