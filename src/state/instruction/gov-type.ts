import { field, fixedArray, variant } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import * as BN from 'bn.js';

export abstract class GovernanceType {}

@variant(0)
export class ConfigAccountType extends GovernanceType {}

@variant(0)
export class MaxPrimaryStake extends ConfigAccountType {
  @field({ type: 'u64' })
  public value!: BN;

  constructor(value: BN) {
    super();
    this.value = value;
  }
}

@variant(1)
export class NftHolderShare extends ConfigAccountType {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(2)
export class InitialRedemptionFee extends ConfigAccountType {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(3)
export class RedemptionFeeDuration extends ConfigAccountType {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}
@variant(4)
export class ValidatorName extends ConfigAccountType {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
@variant(5)
export class TwitterHandle extends ConfigAccountType {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
@variant(6)
export class DiscordInvite extends ConfigAccountType {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}

@variant(1)
export class ProgramUpgrade extends GovernanceType {
  @field({ type: fixedArray('u8', 32) })
  public buffer_account!: PublicKey;

  @field({ type: 'string' })
  public code_link!: string;

  constructor(properties: ProgramUpgrade) {
    super();
    Object.assign(this, properties);
  }
}

@variant(2)
export class VoteAccountGovernance extends GovernanceType {}

@variant(0)
export class ValidatorID extends VoteAccountGovernance {
  @field({ type: fixedArray('u8', 32) })
  public value!: PublicKey;

  constructor(value: PublicKey) {
    super();
    this.value = value;
  }
}

@variant(1)
export class Commission extends VoteAccountGovernance {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}
