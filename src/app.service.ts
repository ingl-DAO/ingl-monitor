import { deserializeUnchecked } from '@dao-xyz/borsh';
import {
  CONNECTION_URL,
  GlobalGems,
  GLOBAL_GEM_KEY,
  INGL_PROGRAM_ID,
  PROPOSAL_KEY,
  VOTE_ACCOUNT_KEY,
  VOTE_DATA_ACCOUNT_KEY,
} from './helpers/state';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';

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
  constructor(private readonly httpService: HttpService) {}

  getData(): { message: string } {
    return { message: 'Welcome to Ingl monitor!' };
  }

  async getInglState() {
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
    } catch (err) {
      this.logger.error(err);
    }
  }
}
