import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Network } from 'src/state';
import { ProgramController } from './program.controller';
import { Program, ProgramSchema } from './program.schema';
import { ProgramService } from './program.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Program.name, schema: ProgramSchema }]),
  ],
  controllers: [ProgramController],
  providers: [
    ProgramService,
    { provide: Connection, useValue: new Connection(clusterApiUrl(Network)) },
  ],
})
export class ProgramModule {}
