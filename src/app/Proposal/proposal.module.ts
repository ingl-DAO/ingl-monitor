import { Module } from '@nestjs/common';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Network } from 'src/state';
import { ProposalController } from './proposal.controller';
import { ProposalService } from './proposal.service';
@Module({
  controllers: [ProposalController],
  providers: [
    ProposalService,
    { provide: Connection, useValue: new Connection(clusterApiUrl(Network)) },
  ],
})
export class ProposalModule {}
