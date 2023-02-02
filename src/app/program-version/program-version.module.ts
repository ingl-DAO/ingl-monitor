import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Network } from 'src/state';
import { ProgramVersionController } from './program-version.controller';
import { ProgramVersion, ProgramVersionSchema } from './program-version.schema';
import { ProgramVersionService } from './program-version.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProgramVersion.name, schema: ProgramVersionSchema },
    ]),
  ],
  controllers: [ProgramVersionController],
  providers: [
    ProgramVersionService,
    { provide: Connection, useValue: new Connection(clusterApiUrl(Network)) },
  ],
})
export class ProgramVersionModule {}
