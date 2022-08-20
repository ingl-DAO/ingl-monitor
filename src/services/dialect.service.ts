import {
  DialectSdk,
  Backend,
  ConfigProps,
  Dialect,
  DialectWalletAdapterWrapper,
  EncryptionKeysStore,
  NodeDialectWalletAdapter,
  TokenStore,
  Dapp,
} from '@dialectlabs/sdk';
import { Keypair } from '@solana/web3.js';
import { CONNECTION_URL } from '../helpers/state';

export class DialectService {
  createSdk(): DialectSdk {
    const keypair = Buffer.from(
      JSON.parse(process.env.DIALECT_KEYPAIR as string)
    );
    const secretKey = Keypair.fromSecretKey(keypair);

    const backends = [Backend.DialectCloud, Backend.Solana];
    const dialectCloud = {
      url: 'https://dialectapi.to',
      tokenStore: TokenStore.createInMemory(),
    };
    const environment = 'production';
    const encryptionKeysStore = EncryptionKeysStore.createInMemory();
    const solana = {
      rpcUrl: CONNECTION_URL,
    };
    // const keypair = Keypair.fromSecretKey(secretKey);
    const wallet = DialectWalletAdapterWrapper.create(
      NodeDialectWalletAdapter.create(secretKey)
    );

    const sdk: DialectSdk = Dialect.sdk({
      backends,
      dialectCloud,
      environment,
      encryptionKeysStore,
      solana,
      wallet,
    } as ConfigProps);

    return sdk;
  }

  async createDapp(): Promise<Dapp> {
    const sdk = this.createSdk();
    let dapp = await sdk.dapps.find();
    if (!dapp) {
      dapp = await sdk.dapps.create({
        name: 'Ingl-DAO',
        description: 'Ingl events notifications dapp',
      });
    }
    return dapp;
  }

  async broadcast(title: string, message: string) {
    const dapp = await this.createDapp();
    await dapp.messages.send({
      title,
      message,
    });
  }
}
