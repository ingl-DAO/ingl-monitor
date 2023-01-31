import { field, fixedArray, option, vec } from '@dao-xyz/borsh';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export const INGL_PROGRAM_ID = new PublicKey(
  '9dSZN479QxPdogZTwjaBRiTfFAvhq3kNF1GEwUWW7es6'
);
export const GLOBAL_GEM_KEY = 'global_gem_account';
export const PROPOSAL_KEY = 'ingl_proposals';
export const VOTE_ACCOUNT_KEY = 'InglVote';
export const VOTE_DATA_ACCOUNT_KEY = 'InglVoteData';
export const CONNECTION_URL = 'https://api.devnet.solana.com';

export class ValidatorProposal {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: vec(fixedArray('u8', 32)) })
  public validator_ids!: PublicKey[];

  @field({ type: 'u32' })
  public date_created!: number;

  @field({ type: option('u32') })
  public date_finalized?: number;

  @field({ type: vec('u32') })
  public votes!: number[];

  @field({ type: option(fixedArray('u8', 32)) })
  public winner?: PublicKey;

  constructor(properties?: {
    validation_phrase: number;
    validator_ids: PublicKey[];
    date_created: number;
    date_finalized?: number;
    votes: number[];
    winner?: PublicKey;
  }) {
    if (properties) {
      this.validation_phrase = properties.validation_phrase;
      this.validator_ids = properties.validator_ids;
      this.date_created = properties.date_created;
      this.date_finalized = properties.date_finalized;
      this.winner = properties.winner;
      this.votes = properties.votes;
    }
  }
}

export class GlobalGems {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: 'u32' })
  public counter!: number;

  @field({ type: 'u64' })
  public total_raised!: BN;

  @field({ type: 'u64' })
  public pd_pool_total!: BN;

  @field({ type: 'u64' })
  public delegated_total!: BN;

  @field({ type: 'u64' })
  public dealloced_total!: BN;

  @field({ type: 'u8' })
  public is_proposal_ongoing!: number;

  @field({ type: 'u32' })
  public proposal_numeration!: number;

  @field({ type: 'u64' })
  public pending_delegation_total!: BN;

  @field({ type: vec(fixedArray('u8', 32)) })
  public validator_list!: PublicKey[];

  constructor(properties?: {
    validation_phrase: number;
    counter: number;
    total_raised: BN;
    pd_pool_total: BN;
    delegated_total: BN;
    dealloced_total: BN;
    is_proposal_ongoing: number;
    proposal_numeration: number;
    pending_delegation_total: BN;
    validator_list: PublicKey[];
  }) {
    if (properties) {
      this.validation_phrase = properties.validation_phrase;
      this.counter = properties.counter;
      this.total_raised = properties.total_raised;
      this.pd_pool_total = properties.pd_pool_total;
      this.delegated_total = properties.delegated_total;
      this.dealloced_total = properties.dealloced_total;
      this.is_proposal_ongoing = properties.is_proposal_ongoing;
      this.proposal_numeration = properties.proposal_numeration;
      this.pending_delegation_total = properties.pending_delegation_total;
      this.validator_list = properties.validator_list;
    }
  }
}
