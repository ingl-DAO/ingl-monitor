import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  clusterApiUrl,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { Network } from '..';

export interface ForwardTransactionParams {
  instructions: TransactionInstruction[];
  signerKeypairs: Keypair[];
  options?: {
    commitment?: Commitment;
    additionalUnits?: number;
  };
}
export interface ForwardVersionnedTransactionParams
  extends ForwardTransactionParams {
  lookupTableAddresses: PublicKey[];
}

export const forwardLegacyTransaction = async ({
  instructions,
  signerKeypairs,
  options,
}: ForwardTransactionParams) => {
  if (signerKeypairs.length === 0)
    throw new Error('Transaction must be signed by at least one keypair.');
  console.log('forwarding legacy transaction...');
  const connection = new Connection(clusterApiUrl(Network));

  const transaction = new Transaction();
  if (options.additionalUnits) {
    const additionalComputeBudgetInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: options.additionalUnits,
      });
    transaction.add(additionalComputeBudgetInstruction);
  }
  transaction.add(...instructions).feePayer = signerKeypairs[0].publicKey;

  const blockhashObj = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashObj.blockhash;
  transaction.sign(...signerKeypairs);

  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  );
  await connection.confirmTransaction({
    signature,
    ...blockhashObj,
  });
  return signature;
};

export async function forwardV0Transaction({
  options,
  instructions,
  signerKeypairs,
  lookupTableAddresses,
}: ForwardVersionnedTransactionParams) {
  if (signerKeypairs.length === 0)
    throw new Error('Transaction must be signed by at least one keypair.');

  const connection = new Connection(clusterApiUrl(Network));

  const lookupTableAccounts: AddressLookupTableAccount[] = [];
  if (lookupTableAddresses) {
    for (let i = 0; i < lookupTableAddresses.length; i++) {
      const lookupTableAccount = await connection
        .getAddressLookupTable(lookupTableAddresses[i])
        .then((res) => res.value);
      if (lookupTableAccount) lookupTableAccounts.push(lookupTableAccount);
      else throw new Error(`Sorry, No Lookup table was found`);
    }
  }
  if (options?.additionalUnits) {
    const additionalComputeBudgetInstruction =
      ComputeBudgetProgram.setComputeUnitLimit({
        units: options?.additionalUnits,
      });
    instructions.unshift(additionalComputeBudgetInstruction);
  }

  const blockhashObj = await connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    recentBlockhash: blockhashObj.blockhash,
    payerKey: signerKeypairs[0].publicKey,
    instructions,
  }).compileToV0Message(lookupTableAccounts);

  const transactionV0 = new VersionedTransaction(messageV0);
  transactionV0.sign(signerKeypairs);

  const signature = await connection.sendTransaction(transactionV0);
  await connection.confirmTransaction({
    signature,
    blockhash: blockhashObj.blockhash,
    lastValidBlockHeight: blockhashObj.lastValidBlockHeight,
  });
  return signature;
}

export function getCloseLookupTableInstructions(
  authority: PublicKey,
  lookupTableAddresses: PublicKey[]
) {
  return [
    ...lookupTableAddresses.map((address) =>
      AddressLookupTableProgram.deactivateLookupTable({
        authority,
        lookupTable: address,
      })
    ),
    ...lookupTableAddresses.map((address) =>
      AddressLookupTableProgram.closeLookupTable({
        authority,
        recipient: authority,
        lookupTable: address,
      })
    ),
  ];
}

export async function createLookupTable(addresses: PublicKey[]) {
  const keypairBuffer = Buffer.from(
    JSON.parse(process.env.BACKEND_KEYPAIR as string)
  );
  const payerKeypair = Keypair.fromSecretKey(keypairBuffer);

  const lookupTableAddresses: PublicKey[] = [];
  const connection = new Connection(clusterApiUrl(Network));
  while (addresses.length > 0) {
    const [lookupTableInst, lookupTableAddress] =
      AddressLookupTableProgram.createLookupTable({
        authority: payerKeypair.publicKey,
        payer: payerKeypair.publicKey,
        recentSlot: await connection.getSlot(),
      });
    lookupTableAddresses.push(lookupTableAddress);
    await forwardLegacyTransaction({
      instructions: [
        lookupTableInst,
        AddressLookupTableProgram.extendLookupTable({
          addresses: addresses.splice(0, 20),
          payer: payerKeypair.publicKey,
          lookupTable: lookupTableAddress,
          authority: payerKeypair.publicKey,
        }),
      ],
      signerKeypairs: [payerKeypair],
      options: { commitment: 'finalized' },
    });
  }
  return lookupTableAddresses;
}
