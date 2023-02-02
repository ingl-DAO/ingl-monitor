import { PublicKey } from '@solana/web3.js';
import { HttpException, HttpStatus } from '@nestjs/common';

export function tryPublicKey(address: string) {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
