import { serialize } from '@dao-xyz/borsh';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  AccountMeta,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  VoteProgram,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { Model } from 'mongoose';
import {
  AUTHORIZED_WITHDRAWER_KEY,
  BPF_LOADER_UPGRADEABLE_ID,
  COLLECTION_HOLDER_KEY,
  FractionlzedExisting,
  GENERAL_ACCOUNT_SEED,
  INGL_CONFIG_SEED,
  INGL_MINT_AUTHORITY_KEY,
  INGL_NFT_COLLECTION_KEY,
  INGL_REGISTRY_PROGRAM_ID,
  INGL_TEAM_ID,
  Init,
  METAPLEX_PROGRAM_ID,
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
    validator_id,
    vote_account_id,
    ...newValidator
  }: RegisterValidatorDto): Promise<[string, Buffer]> {
    const program = await this.findProgram(ProgramUsage.Permissionless);
    if (!program)
      throw new HttpException(
        'No predeployed program available',
        HttpStatus.EXPECTATION_FAILED
      );
    const programPubkey = new PublicKey(program.program_id);

    const payerAccount: AccountMeta = {
      pubkey: new PublicKey(payer_id),
      isSigner: true,
      isWritable: true,
    };

    let validatorAccount: AccountMeta;
    const existingValidatorAccounts: AccountMeta[] = [];

    if (validator_id) {
      validatorAccount = {
        pubkey: new PublicKey(validator_id),
        isWritable: false,
        isSigner: false,
      };
    } else {
      const voteAccountKey = new PublicKey(vote_account_id);
      const voteAccountInfo = await this.connection.getAccountInfo(
        voteAccountKey
      );
      //The first four bytes are used to represent the vote account version
      const validatorId = new PublicKey(voteAccountInfo.data.slice(4, 36));
      const authorizedWithdrawer = new PublicKey(
        voteAccountInfo.data.slice(36, 68)
      );
      if (authorizedWithdrawer.toBase58() !== payerAccount.pubkey.toBase58())
        throw new HttpException(
          'The authorized withdrawer must be the payer',
          HttpStatus.BAD_REQUEST
        );
      const [pdaAuthorityKey] = PublicKey.findProgramAddressSync(
        [Buffer.from(AUTHORIZED_WITHDRAWER_KEY)],
        programPubkey
      );
      existingValidatorAccounts.push(
        payerAccount,
        { pubkey: pdaAuthorityKey, isSigner: false, isWritable: false },
        { pubkey: voteAccountKey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
      );

      validatorAccount = {
        pubkey: validatorId,
        isWritable: false,
        isSigner: false,
      };
    }

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

    const [inglNftCollectionMintKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_NFT_COLLECTION_KEY)],
      programPubkey
    );

    const collectionMintAccount: AccountMeta = {
      pubkey: inglNftCollectionMintKey,
      isSigner: false,
      isWritable: true,
    };

    const [collectionAutorityKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(INGL_MINT_AUTHORITY_KEY)],
      programPubkey
    );

    const mintAuthorityAccount: AccountMeta = {
      pubkey: collectionAutorityKey,
      isSigner: false,
      isWritable: true,
    };

    const splTokenProgramAccount: AccountMeta = {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const sysvarRentAccount: AccountMeta = {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    };

    const systemProgramAccount: AccountMeta = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const [metaplexAccountKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        collectionMintAccount.pubkey.toBuffer(),
      ],
      METAPLEX_PROGRAM_ID
    );

    const collectionMetadataAccount: AccountMeta = {
      pubkey: metaplexAccountKey,
      isSigner: false,
      isWritable: true,
    };

    const [generalAccountPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from(GENERAL_ACCOUNT_SEED)],
      programPubkey
    );

    const generalAccount: AccountMeta = {
      pubkey: generalAccountPubkey,
      isSigner: false,
      isWritable: true,
    };

    const metaplexProgramAccount: AccountMeta = {
      pubkey: METAPLEX_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };

    const [inglCollectionHolderKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(COLLECTION_HOLDER_KEY)],
      programPubkey
    );
    const collectionHolderAccount: AccountMeta = {
      pubkey: inglCollectionHolderKey,
      isSigner: false,
      isWritable: true,
    };
    const associatedTokenAccount: AccountMeta = {
      pubkey: getAssociatedTokenAddressSync(
        inglNftCollectionMintKey,
        inglCollectionHolderKey,
        true
      ),
      isSigner: false,
      isWritable: true,
    };

    const [editionKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METAPLEX_PROGRAM_ID.toBuffer(),
        inglNftCollectionMintKey.toBuffer(),
        Buffer.from('edition'),
      ],
      METAPLEX_PROGRAM_ID
    );
    const collectionEditionAccount: AccountMeta = {
      pubkey: editionKey,
      isSigner: false,
      isWritable: true,
    };

    const associatedTokeProgramAccount: AccountMeta = {
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    const InglRegistryProgramAccount: AccountMeta = {
      pubkey: INGL_REGISTRY_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    const [nameStorageKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('name_storage')],
      INGL_REGISTRY_PROGRAM_ID
    );
    const nameStorageAccount: AccountMeta = {
      pubkey: nameStorageKey,
      isSigner: false,
      isWritable: true,
    };
    const [storageKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('storage')],
      INGL_REGISTRY_PROGRAM_ID
    );
    const storageAccount: AccountMeta = {
      pubkey: storageKey,
      isSigner: false,
      isWritable: true,
    };

    const keypairBuffer = Buffer.from(
      JSON.parse(process.env.BACKEND_KEYPAIR as string)
    );
    const backendKeypair = Keypair.fromSecretKey(keypairBuffer);
    const upgradeAuthorityAccount: AccountMeta = {
      pubkey: backendKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    };

    const teamAccount: AccountMeta = {
      pubkey: INGL_TEAM_ID,
      isSigner: false,
      isWritable: true,
    };

    const programAccount: AccountMeta = {
      pubkey: programPubkey,
      isSigner: false,
      isWritable: false,
    };
    const [programDataKey] = PublicKey.findProgramAddressSync(
      [programPubkey.toBuffer()],
      BPF_LOADER_UPGRADEABLE_ID
    );
    const programDataAccount: AccountMeta = {
      pubkey: programDataKey,
      isSigner: false,
      isWritable: false,
    };
    const voteProgramAccount: AccountMeta = {
      pubkey: VoteProgram.programId,
      isSigner: false,
      isWritable: false,
    };

    const {
      unit_backing: solBacking,
      max_primary_stake,
      governance_expiration_time,
      creator_royalties,
      rarities,
      ...registratioData
    } = newValidator;

    const log_level = 0;
    const initProgramPayload = new (
      vote_account_id ? FractionlzedExisting : Init
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
        payerAccount,
        configAccount,
        generalAccount,
        urisAccount,
        sysvarRentAccount,
        validatorAccount,
        collectionHolderAccount,
        collectionMintAccount,
        mintAuthorityAccount,
        associatedTokenAccount,
        collectionMetadataAccount,
        collectionEditionAccount,
        splTokenProgramAccount,
        systemProgramAccount,
        programDataAccount,
        upgradeAuthorityAccount,

        ...existingValidatorAccounts,

        programAccount,
        teamAccount,
        storageAccount,
        nameStorageAccount,

        ...(vote_account_id ? [voteProgramAccount] : []),
        systemProgramAccount,
        splTokenProgramAccount,
        associatedTokeProgramAccount,
        metaplexProgramAccount,
        InglRegistryProgramAccount,
      ],
    });
    const transaction = new Transaction();
    const blockhashObj = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhashObj.blockhash;
    transaction.add(initProgramInstruction).feePayer = payerAccount.pubkey;
    transaction.sign(backendKeypair);
    return [
      program.program_id,
      transaction.serialize({ requireAllSignatures: false }),
    ];
  }

  async createUploadRaritiesUrisTrans(
    programId: PublicKey,
    feePayer: PublicKey,
    rarities: Rarity[]
  ) {
    const programPubkey = new PublicKey(programId);

    const keypairBuffer = Buffer.from(
      JSON.parse(process.env.BACKEND_KEYPAIR as string)
    );
    const backendKeypair = Keypair.fromSecretKey(keypairBuffer);

    const payerAccount: AccountMeta = {
      pubkey: backendKeypair.publicKey,
      isSigner: true,
      isWritable: true,
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

    const blockhashObj = await this.connection.getLatestBlockhash();
    try {
      return rarities.reduce<Buffer[]>((transactions, { uris }, index) => {
        let [endIndex] = this.getNextOffset(uris, 800);
        do {
          console.log('rarity...', index, endIndex, uris.length);
          const transaction = new Transaction();
          transaction.add(
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
              keys: [payerAccount, configAccount, urisAccount],
            })
          ).feePayer = feePayer;
          transaction.recentBlockhash = blockhashObj.blockhash;
          transaction.sign(backendKeypair);
          transactions.push(
            transaction.serialize({ requireAllSignatures: false })
          );

          uris = uris.slice(endIndex);
          [endIndex] = this.getNextOffset(uris, 800);
          console.log('rarity !!!', index, endIndex, uris.length);
        } while (endIndex < uris.length - 1);
        return transactions;
      }, []);
    } catch (error) {
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
