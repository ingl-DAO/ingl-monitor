import { field, fixedArray, option, variant } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export abstract class UpgradeableLoaderState {}

@variant(0)
export class Uninitialized extends UpgradeableLoaderState {}

@variant(1)
export class BufferState extends UpgradeableLoaderState {
  @field({ type: option(fixedArray('u8', 32)) })
  authority_address?: Uint8Array;

  constructor(authority_address: PublicKey) {
    super();
    this.authority_address = authority_address.toBuffer();
  }
}

@variant(2)
export class ProgramState extends UpgradeableLoaderState {
  @field({ type: fixedArray('u8', 32) })
  programdata_address!: Uint8Array;

  constructor(programdata_address: PublicKey) {
    super();
    this.programdata_address = programdata_address.toBuffer();
  }
}

@variant(3)
export class ProgramDataState extends UpgradeableLoaderState {
  @field({ type: 'u64' })
  slot!: BN;

  @field({ type: option(fixedArray('u8', 32)) })
  upgrade_authority_address?: Uint8Array;

  constructor(properties: ProgramDataState) {
    super();
    Object.assign(this, properties);
  }
}
