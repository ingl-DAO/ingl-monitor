import { deserialize } from '@dao-xyz/borsh';
import { Controller, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { INGL_PROGRAM_ID, ValidatorProposal } from 'src/constants';
import { MonitorService } from './monitor.service';

@Controller()
export class MonitorController {
  private readonly logger = new Logger(MonitorController.name);

  constructor(private monitorService: MonitorService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async monitorInglState() {
    try {
      const {
        current_proposal_numeration,
        vote_account_key,
        inglVoteDataAccount,
        proposalAccountInfo,
      } = await this.monitorService.getOnChainState();
      const inglDbState = await this.monitorService.getDbState();

      if (
        inglVoteDataAccount?.owner.toString() === INGL_PROGRAM_ID.toString() &&
        inglDbState.vote_account_key !== vote_account_key
      ) {
        this.logger.log('New Vote Account', {
          mongoData: inglDbState,
          inglVoteDataAccount,
        });
        this.monitorService.broadcastNewVoteAccount({
          ...inglDbState,
          vote_account_key: vote_account_key.toString(),
        });
      }
      if (current_proposal_numeration > inglDbState.proposal_numeration) {
        this.logger.log('New Proposal', {
          oldData: inglDbState,
          current_proposal_numeration,
        });
        this.monitorService.broadcastNewProposal({
          ...inglDbState,
          proposal_numeration: current_proposal_numeration,
        });
      }

      if (proposalAccountInfo) {
        const { date_finalized } = deserialize(
          proposalAccountInfo.data,
          ValidatorProposal
        );
        if (date_finalized !== inglDbState.date_finalized) {
          this.logger.log('Proposal Finalized', {
            date_finalized,
            mongoData: inglDbState,
          });
          this.monitorService.broadcastFinalizedProposal({
            ...inglDbState,
            date_finalized,
          });
        }
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
