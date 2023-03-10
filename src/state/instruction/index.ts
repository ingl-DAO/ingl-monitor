import { field, vec } from '@dao-xyz/borsh';
import BN from 'bn.js';
import { GovernanceType } from './gov-type';

export * from './helpers';

abstract class Instruction {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Instruction) {
    Object.assign(this, properties);
  }
}

export class MintNft extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 0 });
  }
}

export class ImprintRarity extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 1 });
  }
}

export class Init extends Instruction {
  @field({ type: 'u8' })
  public init_commission!: number;

  @field({ type: 'u64' })
  public max_primary_stake!: BN;

  @field({ type: 'u8' })
  public nft_holders_share!: number;

  @field({ type: 'u8' })
  public initial_redemption_fee!: number;

  @field({ type: 'bool' })
  public is_validator_id_switchable!: boolean;

  @field({ type: 'u64' })
  public unit_backing!: BN;

  @field({ type: 'u32' })
  public redemption_fee_duration!: number;

  @field({ type: 'u8' })
  public proposal_quorum!: number;

  @field({ type: 'u16' })
  public creator_royalties!: number;

  @field({ type: 'u32' })
  public governance_expiration_time!: number;

  @field({ type: vec('u16') })
  public rarities!: number[];

  @field({ type: vec('string') })
  public rarity_names!: string[];

  @field({ type: 'string' })
  public twitter_handle!: string;

  @field({ type: 'string' })
  public discord_invite!: string;

  @field({ type: 'string' })
  public validator_name!: string;

  @field({ type: 'string' })
  public collection_uri!: string;

  @field({ type: 'string' })
  public website!: string;

  @field({ type: 'string' })
  public default_uri!: string;

  constructor({ log_level, ...properties }: Omit<Init, 'instruction'>) {
    super({ log_level, instruction: 2 });
    Object.assign(this, properties);
  }
}

export class Redeem extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 3 });
  }
}

export class NFTWithdraw extends Instruction {
  @field({ type: 'u8' })
  public cnt!: number;

  constructor(cnt: number, log_level: number) {
    super({ log_level, instruction: 4 });
    this.cnt = cnt;
  }
}

export class ProcessRewards extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 5 });
  }
}

export class InitRebalance extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 6 });
  }
}

export class FinalizeRebalance extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 7 });
  }
}

export class UploadUris {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: vec('string') })
  public uris!: string[];

  @field({ type: 'u8' })
  public rarity!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<UploadUris, 'instruction'>) {
    this.instruction = 8;
    Object.assign(this, properties);
  }
}

export class ResetUris extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 9 });
  }
}

export class UnDelegateNFT extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 10 });
  }
}

export class DelegateNFT extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 11 });
  }
}

export class CreateVoteAccount extends Instruction {
  constructor(log_level: number) {
    super({ log_level, instruction: 12 });
  }
}
export class InitGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: GovernanceType })
  public governance_type!: GovernanceType;

  @field({ type: 'string' })
  public title!: string;

  @field({ type: 'string' })
  public description!: string;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<InitGovernance, 'instruction'>) {
    this.instruction = 13;
    Object.assign(this, properties);
  }
}

export class VoteGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'bool' })
  public vote!: boolean;

  @field({ type: 'u8' })
  public cnt!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<VoteGovernance, 'instruction'>) {
    this.instruction = 14;
    Object.assign(this, properties);
  }
}

export class FinalizeGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<FinalizeGovernance, 'instruction'>) {
    this.instruction = 15;
    Object.assign(this, properties);
  }
}

export class ExecuteGovernance {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<ExecuteGovernance, 'instruction'>) {
    this.instruction = 16;
    Object.assign(this, properties);
  }
}

export class InjectTestingData {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u8' })
  public num_mints!: number;

  @field({ type: 'u8' })
  public log_level!: number;

  constructor(properties: Omit<ExecuteGovernance, 'instruction'>) {
    this.instruction = 17;
    Object.assign(this, properties);
  }
}

export class FractionlzedExisting extends Init {
  constructor(propreties: Omit<FractionlzedExisting, 'instruction'>) {
    super(propreties);
    this.instruction = 18;
  }
}
