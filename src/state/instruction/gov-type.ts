import { field, fixedArray, variant } from '@dao-xyz/borsh';
import BN from 'bn.js';

export class GovernanceType {}

@variant(0)
export class ConfigAccount extends GovernanceType {}

@variant(0)
export class MaxPrimaryStake extends ConfigAccount {
  @field({ type: 'u64' })
  public value!: BN;

  constructor(value: BN) {
    super();
    this.value = value;
  }
}

@variant(1)
export class NftHolderShare extends ConfigAccount {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(2)
export class InitialRedemptionFee extends ConfigAccount {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

@variant(3)
export class RedemptionFeeDuration extends ConfigAccount {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}
@variant(4)
export class ValidatorName extends ConfigAccount {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
@variant(5)
export class TwitterHandle extends ConfigAccount {
  @field({ type: 'string' })
  public value!: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
@variant(6)
export class DiscordInvite extends ConfigAccount {
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
  public buffer_account!: Uint8Array;

  @field({ type: 'string' })
  public code_link!: string;

  constructor(properties: ProgramUpgrade) {
    super();
    Object.assign(this, properties);
  }
}

@variant(2)
export class VoteAccount extends GovernanceType {}

@variant(0)
export class ValidatorID extends VoteAccount {
  @field({ type: fixedArray('u8', 32) })
  public value!: Uint8Array;

  constructor(value: Uint8Array) {
    super();
    this.value = value;
  }
}

@variant(1)
export class Commission extends VoteAccount {
  @field({ type: 'u8' })
  public value!: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}
