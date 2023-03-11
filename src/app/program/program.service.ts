import { serialize } from '@dao-xyz/borsh';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AccountMeta,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { Model } from 'mongoose';
import {
  FractionlzedExisting,
  INGL_CONFIG_SEED,
  Init,
  UploadUris,
  URIS_ACCOUNT_SEED,
} from '../../state';
import { Rarity, RegisterValidatorDto } from './program.dto';
import { Program, ProgramDocument, ProgramUsage } from './program.schema';

@Injectable()
export class ProgramService {
  constructor(
    private readonly connection: Connection,
    @InjectModel(Program.name) private programModel: Model<ProgramDocument>
  ) {}

  async findPrograms(filter: {
    is_used?: boolean;
    usage?: ProgramUsage;
  }): Promise<Program[]> {
    return this.programModel.find(filter).exec();
  }

  async findProgram(usage: ProgramUsage) {
    try {
      const programs = await this.findPrograms({ is_used: false, usage });
      const programAccounts = await Promise.all(
        programs.map(({ program_id }) =>
          this.connection.getAccountInfo(new PublicKey(program_id))
        )
      );
      const executablePrograms = programAccounts
        .map((account, index) => ({ account, program: programs[index] }))
        .filter(({ account }) => account !== null && account.executable);

      //In best case senariors will loop once
      for (let i = 0; i < executablePrograms.length; i++) {
        const { program } = executablePrograms[i];
        const [configAccountKey] = PublicKey.findProgramAddressSync(
          [Buffer.from(INGL_CONFIG_SEED)],
          new PublicKey(program.program_id)
        );
        const configAccount = await this.connection.getAccountInfo(
          configAccountKey
        );
        if (!configAccount) return program;
      }
      return null;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async useProgramId(programId: string) {
    await this.programModel.updateOne(
      {
        program: programId,
      },
      {
        $set: { is_used: true },
      }
    );
  }

  async createRegisterValidatorTrans({
    payer_id,
    program_id,
    has_vote_account,
    accounts,

    lookupTableAddresses,

    ...newValidator
  }: RegisterValidatorDto) {
    const programPubkey = new PublicKey(program_id);
    const payerAccountKey = new PublicKey(payer_id);

    const {
      unit_backing: solBacking,
      max_primary_stake,
      governance_expiration_time,
      creator_royalties,
      rarities,
      ...registratioData
    } = newValidator;

    const log_level = 5;
    const initProgramPayload = new (
      has_vote_account ? FractionlzedExisting : Init
    )({
      log_level,
      ...registratioData,
      rarities: rarities.map((_) => _.rarity),
      creator_royalties: creator_royalties * 100,
      unit_backing: new BN(solBacking * LAMPORTS_PER_SOL),
      max_primary_stake: new BN(max_primary_stake * LAMPORTS_PER_SOL),
      governance_expiration_time: governance_expiration_time * (24 * 3600),
    });
    const initProgramInstruction = new TransactionInstruction({
      programId: programPubkey,
      data: Buffer.from(serialize(initProgramPayload)),
      keys: [
        ...accounts.map((account) => ({
          ...account,
          pubkey: new PublicKey(account.pubkey),
        })),
      ],
    });
    try {
      const lookupTableAccounts: AddressLookupTableAccount[] = [];
      for (let i = 0; i < lookupTableAddresses.length; i++) {
        const lookupTableAccount = await this.connection
          .getAddressLookupTable(new PublicKey(lookupTableAddresses[i]))
          .then((res) => res.value);
        if (lookupTableAccount) lookupTableAccounts.push(lookupTableAccount);
        else throw new Error(`Sorry, No Lookup table was found`);
      }

      const additionalComputeBudgetInstruction =
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 300_000,
        });

      const blockhashObj = await this.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        recentBlockhash: blockhashObj.blockhash,
        payerKey: payerAccountKey,
        instructions: [
          additionalComputeBudgetInstruction,
          initProgramInstruction,
        ],
      }).compileToV0Message(lookupTableAccounts);
      const transactionV0 = new VersionedTransaction(messageV0);

      const keypairBuffer = Buffer.from(
        JSON.parse(process.env.BACKEND_KEYPAIR as string)
      );
      const backendKeypair = Keypair.fromSecretKey(keypairBuffer);
      transactionV0.sign([backendKeypair]);
      return {
        transaction: transactionV0.serialize(),
        blockhashObj,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createUploadRaritiesUrisTrans(
    programId: PublicKey,
    feePayer: PublicKey,
    rarities: Rarity[]
  ) {
    const programPubkey = new PublicKey(programId);

    const payerAccount: AccountMeta = {
      pubkey: feePayer,
      isSigner: true,
      isWritable: true,
    };

    const keypairBuffer = Buffer.from(
      JSON.parse(process.env.BACKEND_KEYPAIR as string)
    );
    const backendKeypair = Keypair.fromSecretKey(keypairBuffer);
    const uploadAuthority: AccountMeta = {
      pubkey: backendKeypair.publicKey,
      isSigner: true,
      isWritable: false,
    };
    const [inglConfigKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_CONFIG_SEED)],
      programPubkey
    );
    const configAccount: AccountMeta = {
      pubkey: inglConfigKey,
      isSigner: false,
      isWritable: true,
    };
    const [urisAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(URIS_ACCOUNT_SEED)],
      programPubkey
    );
    const urisAccount: AccountMeta = {
      isSigner: false,
      isWritable: true,
      pubkey: urisAccountKey,
    };
    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const blockhashObj = await this.connection.getLatestBlockhash();
    try {
      return rarities.reduce<{ transaction: Buffer; rarity: number }[]>(
        (transactions, { uris }, index) => {
          let [endIndex] = this.getNextOffset(uris, 800);
          do {
            const transaction = new Transaction();
            transaction.add(
              ComputeBudgetProgram.setComputeUnitLimit({
                units: 1_400_000,
              }),
              new TransactionInstruction({
                programId,
                data: Buffer.from(
                  serialize(
                    new UploadUris({
                      uris: uris.slice(0, endIndex),
                      rarity: index,
                      log_level: 0,
                    })
                  )
                ),
                keys: [
                  payerAccount,
                  configAccount,
                  urisAccount,
                  uploadAuthority,
                  systemProgramAccount,
                ],
              })
            ).feePayer = payerAccount.pubkey;
            transaction.recentBlockhash = blockhashObj.blockhash;
            transaction.lastValidBlockHeight =
              blockhashObj.lastValidBlockHeight;
            transaction.sign(backendKeypair);
            transactions.push({
              rarity: index,
              transaction: transaction.serialize({
                requireAllSignatures: false,
              }),
            });

            uris = uris.slice(endIndex);
            [endIndex] = this.getNextOffset(uris, 800);
          } while (endIndex < uris.length - 1);
          return transactions;
        },
        []
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   *
   * @param array
   * @param max_offset
   * @returns [offset, accumulated_len]
   */
  private getNextOffset(array: string[], max_offset: number) {
    return array.reduce<[number, number]>(
      ([p_index, len], uri, index) => {
        const uriLen = len + Buffer.from(uri).length;
        return uriLen < max_offset ? [index + 1, uriLen] : [p_index, uriLen];
      },
      [0, 0]
    );
  }
}
