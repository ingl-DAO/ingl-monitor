import { deserialize, serialize } from '@dao-xyz/borsh';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  forwardLegacyTransaction,
  GeneralData,
  GENERAL_ACCOUNT_SEED,
  INGL_CONFIG_SEED,
  INGL_PROPOSAL_KEY,
  InitGovernance,
  NFT_ACCOUNT_CONST,
  toBytesInt32,
  VOTE_ACCOUNT_KEY,
} from 'src/state';
import { Saveguards } from './proposal.dto';

@Injectable()
export class ProposalService {
  constructor(private connection: Connection) {}

  async create(
    programId: PublicKey,
    initGovernance: InitGovernance,
    { associated_token_id, nft_mint_id }: Saveguards
  ) {
    const keypairBuffer = Buffer.from(
      JSON.parse(process.env.BACKEND_KEYPAIR as string)
    );
    const payerKeypair = Keypair.fromSecretKey(keypairBuffer);

    const payerAccount: AccountMeta = {
      pubkey: payerKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    };
    const [generalAccountPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      programId
    );

    const generalAccount: AccountMeta = {
      pubkey: generalAccountPubkey,
      isSigner: false,
      isWritable: true,
    };
    const generalAccountInfo = await this.connection.getAccountInfo(
      generalAccountPubkey
    );
    if (generalAccountInfo)
      throw new HttpException(
        `No general account was found for program with address: ${programId.toBase58()}`,
        HttpStatus.NOT_FOUND
      );
    const { proposal_numeration } = deserialize(
      generalAccountInfo?.data as Buffer,
      GeneralData,
      { unchecked: true }
    );
    const [proposalAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_PROPOSAL_KEY), toBytesInt32(proposal_numeration)],
      programId
    );
    const proposalAccount: AccountMeta = {
      pubkey: proposalAccountKey,
      isSigner: false,
      isWritable: false,
    };

    const mintAccount: AccountMeta = {
      pubkey: new PublicKey(nft_mint_id),
      isSigner: false,
      isWritable: false,
    };
    const associatedTokenAccount: AccountMeta = {
      pubkey: new PublicKey(associated_token_id),
      isSigner: false,
      isWritable: false,
    };
    const [nftPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(NFT_ACCOUNT_CONST)],
      programId
    );
    const nftAccount: AccountMeta = {
      pubkey: nftPubkey,
      isSigner: false,
      isWritable: false,
    };
    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programId
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: true,
    };
    const [voteAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(VOTE_ACCOUNT_KEY)],
      programId
    );
    const voteAccount: AccountMeta = {
      pubkey: voteAccountKey,
      isSigner: false,
      isWritable: true,
    };

    const initGovernanceInstructions = new TransactionInstruction({
      keys: [
        payerAccount,
        voteAccount,
        proposalAccount,
        generalAccount,
        mintAccount,
        associatedTokenAccount,
        nftAccount,
        configAccount,
      ],
      programId,
      data: Buffer.from(serialize(initGovernance)),
    });

    try {
      return forwardLegacyTransaction({
        instructions: [initGovernanceInstructions],
        signerKeypairs: [payerKeypair],
      });
    } catch (error) {
      throw new HttpException(
        `Validator program registration failed with the following errors: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
