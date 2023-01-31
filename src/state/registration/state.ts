import { field, fixedArray, vec } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';

export const REGISTRY_PROGRAMS_API_KEY =
  'G0Xk2aLhmwfIKlFgiwPkaOtIOy3hHURe1hvuC4pMlGUloSptWWwTRgOP4KkZtRyO';
export const REGISTRY_PROGRAMS_API_ID = '63cd5e0fafdfb84e6a0914e4';
export const VALIDATOR_REGISTRY_PROGRAM_ID = new PublicKey(
  '38pfsot7kCZkrttx1THEDXEz4JJXmCCcaDoDieRtVuy5'
);
export const CONFIG_VALIDATION_PHASE = 373_836_823;
export const STORAGE_VALIDATION_PHASE = 332_049_381;
export const MAX_PROGRAMS_PER_STORAGE_ACCOUNT = 625;
export const SPAM_PREVENTION_SOL = new BN(1_000_000_000);

export class Config {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: 'u32' })
  public validation_number!: number;

  constructor(properties: Config) {
    Object.assign(this, properties);
  }
}

export class ProgramStorage {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: vec(fixedArray('u8', 32)) })
  public programs!: PublicKey[];

  constructor(properties: ProgramStorage) {
    Object.assign(this, properties);
  }
}
