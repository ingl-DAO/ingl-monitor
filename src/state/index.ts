import { field, fixedArray, option, variant, vec } from '@dao-xyz/borsh';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { GovernanceType } from './instruction/gov-type';

export * from './instruction';
export * from './registration';

export const DEVNET_PRICE_FEEDS = [
  '9ATrvi6epR5hVYtwNs7BB7VCiYnd4WM7e8MfafWpfiXC', //BTC_USD
  '7LLvRhMs73FqcLkA8jvEE1AM2mYZXTmqfUv8GAEurymx', //SOL_USD
  '6fhxFvPocWapZ5Wa2miDnrX2jYRFKvFqYnX11GGkBo2f', //ETH_USD
  'DR6PqK15tD21MEGSLmDpXwLA7Fw47kwtdZeUMdT7vd7L', //BNB_USD
  'HPRYVJQ3DcTqszvorS4gCwbJvvNeWMgaCCoF3Lj3sAgC', //ADA_USD
  '2qcLzR7FatMnfCbiB9BdhGsd6SxDgEqWq7xkD62n3xoT', //BCH_USD
  'Bux82YCH8DgqFAQTKBxuQHDp3cud5AhD1Kibhjadz22D', //SBR_USD
  '9gGvxPErkRubNj1vKE19smLa4Kp89kkzMVyA6TMvmKEZ', //ZEC_USD
  '3WNhN4RJwRui4R3k1S9agGzyMZkCwKQkWjoEHbDeAF8J', //LUNA_USD
  'CNzjdKHfXqyAeGd2APpzvwLcuPACrFdHb3k6SLsod6Ao', //TRX_USD
  '6cBTHY4HQ4PABmhUqVLT4n4bNpmZAi2br5VnqTQoVRUo', //SUSHI_USD
  'GRGMtrTszsoNzjqwTxsvkHVAPq5Snju2UzaAws5KBPed', //DOGE_USD
  'C9CeLP5B4Lqq7cFppRBUZjt6hrvd99YR3Sk4EPPuAoAC', //LTC_USD
  'FReW6u9YPpGQNaeEHNkVqA4KGA2WzbcT87NThwFb7fwm', //XLM_USD
  'GEp5pZFjFPqn1teMmx9sLPyADf9N9aQsRn9TE17PwmmL', //LINK_USD
  'Fd3UQMqmKCA6SNf6To97PdC2H3EfzYWR5bxr5CBYuFiy', //DOT_USD
  'EQHf8ueSzJUPELF6yZkyGfwjbLsDmMwFrAYehmC15b6c', //XMR_USD
  'C5x5W7BHVY61ULtWQ3qkP7kpE6zHViWd4AHpKDuAywPw', //SRM_USD
  'HnbpTLbdv78hkVCDBZ52o5E6bkqtsZp4tUXBd2E8Sw9x', //PORT_USD
  'EbpMMgMkC4Jt2oipUBc2GPL4XQo5uxKT8NpF8NEZWvqL', //PAI_USD
];
export const MAINNET_PRICE_FEEDS = [
  '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee', //BTC
  'E3cqnoFvTeKKNsGmC8YitpMjo2E39hwfoyt2Aiem7dCb', //SOL
];
export const INITIALIZER_ID = new PublicKey(
  '62uPowNXr22WPw7XghajJkWMBJ2fnv1oGthxqHYYPHie'
);
export const INGL_REGISTRY_PROGRAM_ID = new PublicKey(
  '38pfsot7kCZkrttx1THEDXEz4JJXmCCcaDoDieRtVuy5'
);
export const INGL_TEAM_ID = new PublicKey(
  'Et2tm6NsfBZJbEYXtWTv9k51V4tWtQvufexSgXoDRGVA'
);
export const METAPLEX_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);
export const BPF_LOADER_UPGRADEABLE_ID = new PublicKey(
  'BPFLoaderUpgradeab1e11111111111111111111111'
);
export const Network: WalletAdapterNetwork = WalletAdapterNetwork.Devnet;

export const INGL_CONFIG_SEED = 'ingl_config';
export const URIS_ACCOUNT_SEED = 'uris_account';
export const GENERAL_ACCOUNT_SEED = 'general_account';
export const INGL_NFT_COLLECTION_KEY = 'ingl_nft_collection';
export const INGL_MINT_AUTHORITY_KEY = 'ingl_mint_authority';
export const COLLECTION_HOLDER_KEY = 'collection_holder';
export const VOTE_ACCOUNT_KEY = 'vote_account';
export const AUTHORIZED_WITHDRAWER_KEY = 'authorized_withdrawer';
export const STAKE_ACCOUNT_KEY = 'stake_account';
export const PD_POOL_ACCOUNT_KEY = 'pd_pool_account';
export const NFT_ACCOUNT_CONST = 'nft_account';
export const INGL_PROGRAM_AUTHORITY_KEY = 'ingl_program_authority';
export const INGL_PROPOSAL_KEY = 'ingl_proposal';
export const VRF_STATE_KEY = 'ingl_vrf_state_key';
export const VALIDATOR_ID_SEED = 'validator_ID___________________';
export const T_STAKE_ACCOUNT_KEY = 't_stake_account_key';
export const T_WITHDRAW_KEY = 't_withdraw_key';

class FundsLocation {}
@variant(0)
export class Delegated extends FundsLocation {}

@variant(1)
export class Undelegated extends FundsLocation {}

export class Vote extends Map<number, boolean> {}

export class NftData {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: option('u8') })
  public rarity?: number;

  @field({ type: option('u32') })
  public rarity_seed_time?: number;

  @field({ type: FundsLocation })
  public funds_location!: FundsLocation;

  @field({ type: 'u32' })
  public numeration!: number;

  @field({ type: 'u32' })
  public date_created!: number;

  @field({ type: option('u64') })
  public last_withdrawal_epoch?: BN;

  @field({ type: option('u64') })
  public last_delegation_epoch?: BN;

  @field({ type: vec('u64') })
  public all_withdraws!: BN[];

  @field({ type: Vote })
  public all_votes!: Vote;

  constructor(properties: NftData) {
    Object.assign(this, properties);
  }
}

export class RebalancingData {
  @field({ type: 'u64' })
  public pending_validator_rewards!: BN;

  @field({ type: 'u64' })
  public unclaimed_validator_rewards!: BN;

  @field({ type: 'bool' })
  public is_rebalancing_active!: boolean;

  constructor(properties: RebalancingData) {
    Object.assign(this, properties);
  }
}

export class VoteReward {
  @field({ type: 'u64' })
  public epoch_number!: BN;

  @field({ type: 'u64' })
  public total_reward!: BN;

  @field({ type: 'u64' })
  public total_stake!: BN;

  @field({ type: 'u64' })
  public nft_holders_reward!: BN;

  constructor(properties: VoteReward) {
    Object.assign(this, properties);
  }
}

export class GeneralData {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: 'u32' })
  public mint_numeration!: number;

  @field({ type: 'u64' })
  public pending_delegation_total!: BN;

  @field({ type: 'u64' })
  public dealloced!: BN;

  @field({ type: 'u64' })
  public total_delegated!: BN;

  @field({ type: 'u64' })
  public last_withdraw_epoch!: BN;

  @field({ type: 'u64' })
  public last_total_staked!: BN;

  @field({ type: 'bool' })
  public is_t_stake_initialized!: boolean;

  @field({ type: 'u32' })
  public proposal_numeration!: number;

  @field({ type: 'u32' })
  public last_feeless_redemption_date!: number;

  @field({ type: 'u32' })
  public last_validated_validator_id_proposal!: number;

  @field({ type: RebalancingData })
  public rebalancing_data!: RebalancingData;

  @field({ type: vec(VoteReward) })
  public vote_rewards!: VoteReward[];

  constructor(properties: GeneralData) {
    Object.assign(this, properties);
  }
}

export class GovernanceData {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: 'u32' })
  public expiration_time!: number;

  @field({ type: 'bool' })
  public is_still_ongoing!: boolean;

  @field({ type: option('u32') })
  public date_finalized?: number;

  @field({ type: option('bool') })
  public did_proposal_pass?: boolean;

  @field({ type: 'bool' })
  public is_proposal_executed!: boolean;

  @field({ type: 'string' })
  public title!: string;

  @field({ type: 'string' })
  public description!: string;

  @field({ type: Vote })
  public votes!: Vote;

  @field({ type: GovernanceType })
  public governance_type!: GovernanceType;

  constructor(properties: GovernanceData) {
    Object.assign(this, properties);
  }
}

export class ValidatorConfig {
  @field({ type: 'u32' })
  public validation_phrase!: number;

  @field({ type: 'bool' })
  is_validator_id_switchable!: boolean;

  @field({ type: 'u64' })
  max_primary_stake!: BN;

  @field({ type: 'u8' })
  nft_holders_share!: number;

  @field({ type: 'u8' })
  initial_redemption_fee!: number;

  @field({ type: 'u64' })
  unit_backing!: BN;

  @field({ type: 'u32' })
  redemption_fee_duration!: number;

  @field({ type: 'u8' })
  proposal_quorum!: number;

  @field({ type: 'u16' })
  creator_royalties!: number;

  @field({ type: 'u8' })
  commission!: number;

  @field({ type: fixedArray('u8', 32) })
  validator_id!: PublicKey;

  @field({ type: 'u32' })
  governance_expiration_time!: number;

  @field({ type: 'string' })
  default_uri!: string;

  @field({ type: 'string' })
  validator_name!: string;

  @field({ type: 'string' })
  twitter_handle!: string;

  @field({ type: 'string' })
  discord_invite!: string;

  @field({ type: 'string' })
  website!: string;

  constructor(properties: ValidatorConfig) {
    Object.assign(this, properties);
  }
}
