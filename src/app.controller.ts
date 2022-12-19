import { deserializeUnchecked } from '@dao-xyz/borsh';
import { Controller, Get, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from './app.service';
import { INGL_PROGRAM_ID, ValidatorProposal } from './helpers/state';
import { DialectService } from './services/dialect.service';
import { MongoService } from './services/monitor.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly monitorService: MongoService,
    private readonly dialectService: DialectService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async notify() {
    try {
      const {
        current_proposal_numeration,
        vote_account_key,
        inglVoteDataAccount,
        proposalAccountInfo,
      } = await this.appService.getInglState();
      const mongoData = await this.monitorService.findOne();

      if (
        inglVoteDataAccount?.owner.toString() === INGL_PROGRAM_ID.toString() &&
        mongoData.vote_account_key !== vote_account_key
      ) {
        this.logger.log('New Vote Account', {
          mongoData,
          inglVoteDataAccount,
        });
        await this.dialectService.broadcast(
          'New Ingl Vote Account Created',
          `A new vote account has been created. Please delegate your NFT and receive voting rewards.  https://app.ingl.io/nft`
        );
        await this.monitorService.update({
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
        await this.monitorService.update({
          ...mongoData,
          proposal_numeration: current_proposal_numeration,
        });
      }

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
          await this.monitorService.update({
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
