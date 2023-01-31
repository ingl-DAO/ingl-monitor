import { deserialize } from '@dao-xyz/borsh';
import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { CollectionName, InglState } from 'src/Mongo/mongo.dto';
import { MongoService } from 'src/Mongo/mongo.service';
import {
  CONNECTION_URL,
  GlobalGems,
  GLOBAL_GEM_KEY,
  INGL_PROGRAM_ID,
  PROPOSAL_KEY,
  VOTE_ACCOUNT_KEY,
  VOTE_DATA_ACCOUNT_KEY
} from '../../state/constants';
import { AppSdk } from '../app.sdk';

export const toBytesInt32 = (num: number) => {
  const arr = new Uint8Array([
    (num & 0xff000000) >> 24,
    (num & 0x00ff0000) >> 16,
    (num & 0x0000ff00) >> 8,
    num & 0x000000ff,
  ]);
  return arr;
};

export const ConnectionService = {
  provide: Connection,
  useValue: new Connection(CONNECTION_URL),
};

@Injectable()
export class MonitorService {
  constructor(
    private appSdk: AppSdk,
    private connection: Connection,
    private mongoService: MongoService
  ) {}

  async getOnChainState() {
    try {
      const [global_gem_pubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_GEM_KEY)],
        INGL_PROGRAM_ID
      );

      const globalGemAccountInfo = await this.connection.getAccountInfo(
        global_gem_pubkey
      );

      const { proposal_numeration: current_proposal_numeration } = deserialize(
        globalGemAccountInfo?.data as Buffer,
        GlobalGems
      );

      const [vote_account_key] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(VOTE_ACCOUNT_KEY),
          Buffer.from(toBytesInt32(current_proposal_numeration - 1)),
        ],
        INGL_PROGRAM_ID
      );
      const [ingl_vote_data_key] = PublicKey.findProgramAddressSync(
        [Buffer.from(VOTE_DATA_ACCOUNT_KEY), vote_account_key.toBuffer()],
        INGL_PROGRAM_ID
      );
      const inglVoteDataAccount = await this.connection.getAccountInfo(
        ingl_vote_data_key
      );

      const [proposal_pubkey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(PROPOSAL_KEY),
          toBytesInt32(current_proposal_numeration - 1),
        ],
        INGL_PROGRAM_ID
      );
      const proposalAccountInfo = await this.connection.getAccountInfo(
        proposal_pubkey
      );

      return {
        inglVoteDataAccount,
        proposalAccountInfo,
        current_proposal_numeration,
        vote_account_key: vote_account_key.toString(),
      };
    } catch (error) {
      Logger.error(error.message, MonitorService.name);
    }
  }

  async getDbState() {
    return this.mongoService.findOne<InglState>(CollectionName.InglState, {
      data_id: process.env.INGL_STATE_ID,
    });
  }

  async broadcastNewVoteAccount(inglState: InglState) {
    await this.appSdk.broadcast(
      'New Ingl Vote Account Created',
      `A new vote account has been created. Please delegate your NFT and receive voting rewards.  https://app.ingl.io/nft`
    );
    await this.mongoService.update(
      CollectionName.InglState,
      { data_id: process.env.INGL_STATE_ID },
      { ...inglState }
    );
  }

  async broadcastNewProposal(inglState: InglState) {
    await this.appSdk.broadcast(
      'New Validator Selection Proposal',
      `A new validator selection proposal has been created. Please vote on the best suited validator at https://app.ingl.io/dao`
    );
    await this.mongoService.update(
      CollectionName.InglState,
      { data_id: process.env.INGL_STATE_ID },
      { ...inglState }
    );
  }

  async broadcastFinalizedProposal(inglState: InglState) {
    await this.appSdk.broadcast(
      'Ingl Proposal Finalized',
      `A proposal has been finalized. Get ready to delegate once a vote account is created. https://app.ingl.io/nft`
    );
    await this.mongoService.update(
      CollectionName.BetaUsers,
      { data_id: process.env.INGL_STATE_ID },
      { ...inglState }
    );
  }
}
