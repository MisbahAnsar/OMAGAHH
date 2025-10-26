import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { AnchorProvider, Program, web3, BN, Idl } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Program ID (will be generated after deployment)
export const CASINO_PROGRAM_ID = new PublicKey('CasinoProgram11111111111111111111111111111');

// PDAs
export const getCasinoPDA = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('casino')],
    CASINO_PROGRAM_ID
  );
  return pda;
};

export const getVaultPDA = () => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    CASINO_PROGRAM_ID
  );
  return pda;
};

// IDL for the program
const CASINO_IDL: Idl = {
  version: '0.1.0',
  name: 'casino',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'casino', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'playCoinFlip',
      accounts: [
        { name: 'casino', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'player', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'betAmount', type: 'u64' },
        { name: 'prediction', type: 'u8' },
      ],
    },
    {
      name: 'playDiceRoll',
      accounts: [
        { name: 'casino', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'player', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'betAmount', type: 'u64' },
        { name: 'prediction', type: 'u8' },
        { name: 'isOver', type: 'bool' },
      ],
    },
    {
      name: 'playSlots',
      accounts: [
        { name: 'casino', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'player', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'betAmount', type: 'u64' }],
    },
    {
      name: 'fundVault',
      accounts: [
        { name: 'casino', isMut: false, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
  ],
  accounts: [
    {
      name: 'Casino',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'vaultBump', type: 'u8' },
          { name: 'totalWagered', type: 'u64' },
          { name: 'totalPayout', type: 'u64' },
          { name: 'houseEdge', type: 'u16' },
          { name: 'minBet', type: 'u64' },
          { name: 'maxBet', type: 'u64' },
        ],
      },
    },
  ],
  events: [
    {
      name: 'GamePlayed',
      fields: [
        { name: 'player', type: 'publicKey', index: false },
        { name: 'gameType', type: 'u8', index: false },
        { name: 'betAmount', type: 'u64', index: false },
        { name: 'prediction', type: 'u8', index: false },
        { name: 'result', type: 'u8', index: false },
        { name: 'won', type: 'bool', index: false },
        { name: 'payout', type: 'u64', index: false },
        { name: 'timestamp', type: 'i64', index: false },
      ],
    },
  ],
  errors: [
    { code: 6000, name: 'BetTooLow', msg: 'Bet amount is too low' },
    { code: 6001, name: 'BetTooHigh', msg: 'Bet amount is too high' },
    { code: 6002, name: 'InvalidPrediction', msg: 'Invalid prediction' },
    { code: 6003, name: 'InvalidBetAmount', msg: 'Invalid bet amount' },
  ],
};

// Casino Program Client
export class CasinoProgram {
  private program: Program;
  private connection: Connection;
  private wallet: WalletContextState;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection;
    this.wallet = wallet;

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    this.program = new Program(CASINO_IDL, CASINO_PROGRAM_ID, provider);
  }

  // Play Coin Flip
  async playCoinFlip(betAmount: number, prediction: 'heads' | 'tails'): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    const predictionValue = prediction === 'heads' ? 0 : 1;
    const betLamports = new BN(betAmount * LAMPORTS_PER_SOL);

    const tx = await this.program.methods
      .playCoinFlip(betLamports, predictionValue)
      .accounts({
        casino: getCasinoPDA(),
        vault: getVaultPDA(),
        player: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Play Dice Roll
  async playDiceRoll(
    betAmount: number,
    targetNumber: number,
    isOver: boolean
  ): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    const betLamports = new BN(betAmount * LAMPORTS_PER_SOL);

    const tx = await this.program.methods
      .playDiceRoll(betLamports, targetNumber, isOver)
      .accounts({
        casino: getCasinoPDA(),
        vault: getVaultPDA(),
        player: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Play Slots
  async playSlots(betAmount: number): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    const betLamports = new BN(betAmount * LAMPORTS_PER_SOL);

    const tx = await this.program.methods
      .playSlots(betLamports)
      .accounts({
        casino: getCasinoPDA(),
        vault: getVaultPDA(),
        player: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Get Casino State
  async getCasinoState() {
    const casinoPDA = getCasinoPDA();
    const casino = await this.program.account.casino.fetch(casinoPDA);
    return {
      authority: casino.authority,
      totalWagered: casino.totalWagered.toNumber() / LAMPORTS_PER_SOL,
      totalPayout: casino.totalPayout.toNumber() / LAMPORTS_PER_SOL,
      houseEdge: casino.houseEdge,
      minBet: casino.minBet.toNumber() / LAMPORTS_PER_SOL,
      maxBet: casino.maxBet.toNumber() / LAMPORTS_PER_SOL,
    };
  }

  // Listen for game events
  listenToGameEvents(callback: (event: any) => void) {
    const eventSubscriptionId = this.program.addEventListener(
      'GamePlayed',
      (event) => {
        callback({
          player: event.player.toString(),
          gameType: event.gameType,
          betAmount: event.betAmount.toNumber() / LAMPORTS_PER_SOL,
          prediction: event.prediction,
          result: event.result,
          won: event.won,
          payout: event.payout.toNumber() / LAMPORTS_PER_SOL,
          timestamp: event.timestamp.toNumber(),
        });
      }
    );

    return () => {
      this.program.removeEventListener(eventSubscriptionId);
    };
  }

  // Parse game result from transaction
  async parseGameResult(signature: string) {
    const tx = await this.connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      throw new Error('Transaction not found');
    }

    // Parse logs to find the game result
    const logs = tx.meta.logMessages || [];
    
    for (const log of logs) {
      if (log.includes('GamePlayed')) {
        // Parse the event data from logs
        // This is a simplified version - in production, decode properly
        return {
          won: log.includes('"won":true'),
          signature,
        };
      }
    }

    return { won: false, signature };
  }
}

// Helper function to initialize the casino (admin only, one-time)
export async function initializeCasino(
  connection: Connection,
  wallet: WalletContextState
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: 'confirmed',
  });

  const program = new Program(CASINO_IDL, CASINO_PROGRAM_ID, provider);

  const tx = await program.methods
    .initialize()
    .accounts({
      casino: getCasinoPDA(),
      vault: getVaultPDA(),
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

