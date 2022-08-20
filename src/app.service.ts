import { deserializeUnchecked } from '@dao-xyz/borsh';
import {
  CONNECTION_URL,
  GlobalGems,
  GLOBAL_GEM_KEY,
  INGL_PROGRAM_ID,
  PROPOSAL_KEY,
  ValidatorProposal,
  VOTE_ACCOUNT_KEY,
  VOTE_DATA_ACCOUNT_KEY,
} from './helpers/state';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection, PublicKey } from '@solana/web3.js';
import { MongoService } from './services/mongo.service';
import { DialectService } from './services/dialect.service';

export const toBytesInt32 = (num: number) => {
  const arr = new Uint8Array([
    (num & 0xff000000) >> 24,
    (num & 0x00ff0000) >> 16,
    (num & 0x0000ff00) >> 8,
    num & 0x000000ff,
  ]);
  return arr;
};

@Injectable()
export class AppService {
  private connection = new Connection(CONNECTION_URL);
  private readonly logger = new Logger(AppService.name);
  constructor(
    private readonly httpService: HttpService,
    private mongoService: MongoService,
    private dialectService: DialectService
  ) {}

  getData(): { message: string } {
    return { message: 'Welcome to Ingl monitor!' };
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async broadcast() {
    try {
      this.logger.log('Broadcasting....');
      this.httpService.axiosRef
        .get('https://ingl-dao.herokuapp.com/')
        .then(({ data }) => {
          this.logger.log(data.message);
        });

      const [global_gem_pubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_GEM_KEY)],
        INGL_PROGRAM_ID
      );

      const globalGemAccountInfo = await this.connection.getAccountInfo(
        global_gem_pubkey
      );

      const { proposal_numeration: current_proposal_numeration } =
        deserializeUnchecked(GlobalGems, globalGemAccountInfo?.data as Buffer);

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
      const mongoData = await this.mongoService.findOne();
      if (
        inglVoteDataAccount?.owner.toString() === INGL_PROGRAM_ID.toString() &&
        mongoData.vote_account_key !== vote_account_key.toString()
      ) {
        this.logger.log('New Vote Account', {
          mongoData,
          inglVoteDataAccount,
        });
        await this.dialectService.broadcast(
          'New Ingl Vote Account Created',
          `A new vote account has been created. Please delegate your NFT and receive voting rewards.  https://app.ingl.io/nft`
        );
        await this.mongoService.update({
          ...mongoData,
          vote_account_key: vote_account_key.toString(),
        });
      }
      if (current_proposal_numeration > mongoData.proposal_numeration) {
        this.logger.log('New Proposal', {
          oldData: mongoData,
          current_proposal_numeration,
        });
        await this.dialectService.broadcast(
          'New Validator Selection Proposal',
          `A new validator selection proposal has been created. Please vote on the best suited validator at https://app.ingl.io/dao`
        );
        await this.mongoService.update({
          ...mongoData,
          proposal_numeration: current_proposal_numeration,
        });
      }

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
      if (proposalAccountInfo) {
        const { date_finalized } = deserializeUnchecked(
          ValidatorProposal,
          proposalAccountInfo.data
        );
        if (date_finalized !== mongoData.date_finalized) {
          this.logger.log('Proposal Finalized', {
            date_finalized,
            mongoData,
          });
          await this.dialectService.broadcast(
            'Ingl Proposal Finalized',
            `A proposal has been finalized. Get ready to delegate once a vote account is created. https://app.ingl.io/nft`
          );
          await this.mongoService.update({
            ...mongoData,
            date_finalized,
          });
        }
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
