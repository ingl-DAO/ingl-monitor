import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import BN from 'bn.js';
import { isNumberString, isURL } from 'class-validator';
import { tryPublicKey } from 'src/utils';
import { InitGovernance } from '../../state';
import {
  Commission,
  DiscordInvite,
  GovernanceType,
  InitialRedemptionFee,
  MaxPrimaryStake,
  NftHolderShare,
  ProgramUpgrade,
  RedemptionFeeDuration,
  TwitterHandle,
  ValidatorID,
  ValidatorName,
} from '../../state/instruction/gov-type';
import {
  ConfigAccountEnum,
  CreateProposalDto,
  VoteAccountEnum,
} from './proposal.dto';
import { ProposalService } from './proposal.service';

@Controller('proposals')
export class ProposalController {
  constructor(private proposalService: ProposalService) {}

  @Post('new')
  async createNewProposal(
    @Body()
    {
      title,
      program_id,
      safeguards,
      description,
      voteAccount,
      configAccount,
      programUpgrade,
    }: CreateProposalDto
  ) {
    if (!configAccount && !programUpgrade && !voteAccount)
      throw new HttpException(
        'One of the following fields most be provided: `programUpgrade`, `voteAccount` or `configAccount`.',
        HttpStatus.BAD_REQUEST
      );
    else if (
      [configAccount, programUpgrade, voteAccount].filter((_) => _).length > 1
    )
      throw new HttpException(
        'Your can only provide value for one field among the followings: `programUpgrade`, `voteAccount` or `configAccount`',
        HttpStatus.BAD_REQUEST
      );
    let governanceType = new GovernanceType();
    if (voteAccount) {
      const { vote_type, value } = voteAccount;
      if (vote_type === VoteAccountEnum.ValidatorID) {
        const validatorId = tryPublicKey(value);
        governanceType = new ValidatorID(validatorId.toBuffer());
      } else {
        if (!isNumberString(value))
          throw new HttpException(
            `VoteAccount commission value most be a number string`,
            HttpStatus.BAD_REQUEST
          );
        governanceType = new Commission(Number(value));
      }
    } else if (programUpgrade) {
      const { buffer_account, code_link } = programUpgrade;
      const bufferAccount = tryPublicKey(buffer_account);
      governanceType = new ProgramUpgrade({
        buffer_account: bufferAccount.toBuffer(),
        code_link,
      });
    } else {
      const { config_type, value } = configAccount;
      if (
        [
          ConfigAccountEnum.MaxPrimaryStake,
          ConfigAccountEnum.NftHolderShare,
          ConfigAccountEnum.InitialRedemptionFee,
          ConfigAccountEnum.RedemptionFeeDuration,
        ].includes(config_type) &&
        !isNumberString(value)
      )
        throw new HttpException(
          `MaxPrimaryStake, NftHolderShare, InitialRedemptionFee and RedemptionFeeDuration values most be number strings`,
          HttpStatus.BAD_REQUEST
        );
      if (
        [
          ConfigAccountEnum.TwitterHandle,
          ConfigAccountEnum.DiscordInvite,
        ].includes(config_type) &&
        !isURL(value)
      )
        throw new HttpException(
          `TwitterHandle and DiscordInvite value most be url links`,
          HttpStatus.BAD_REQUEST
        );
      switch (config_type) {
        case ConfigAccountEnum.MaxPrimaryStake: {
          governanceType = new MaxPrimaryStake(
            new BN(Number(value) * LAMPORTS_PER_SOL)
          );
        }
        case ConfigAccountEnum.NftHolderShare: {
          governanceType = new NftHolderShare(Number(value));
        }
        case ConfigAccountEnum.InitialRedemptionFee: {
          governanceType = new InitialRedemptionFee(Number(value));
        }
        case ConfigAccountEnum.RedemptionFeeDuration: {
          governanceType = new RedemptionFeeDuration(Number(value));
        }
        case ConfigAccountEnum.ValidatorName: {
          governanceType = new ValidatorName(value);
        }
        case ConfigAccountEnum.TwitterHandle: {
          governanceType = new TwitterHandle(value);
        }
        case ConfigAccountEnum.DiscordInvite: {
          governanceType = new DiscordInvite(value);
        }
      }
    }
    return this.proposalService.create(
      tryPublicKey(program_id),
      new InitGovernance({
        title,
        description,
        log_level: 0,
        governance_type: governanceType,
      }),
      safeguards
    );
  }
}
