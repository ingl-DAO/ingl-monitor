import { field } from '@dao-xyz/borsh';

export class InitConfig {
  @field({ type: 'u8' })
  public instruction!: number;

  constructor() {
    this.instruction = 0;
  }
}

export class AddProgram {
  @field({ type: 'u8' })
  public instruction!: number;

  constructor() {
    this.instruction = 1;
  }
}

export class RevomePrograms {
  @field({ type: 'u8' })
  public instruction!: number;

  @field({ type: 'u8' })
  public program_count!: number;

  constructor(program_count: number) {
    this.instruction = 2;
    this.program_count = program_count;
  }
}

export class Blank {
  @field({ type: 'u8' })
  public instruction!: number;

  constructor() {
    this.instruction = 3;
  }
}
