import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { AnchorProvider, Program, web3, BN, Idl } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import CasinoIDL from '../idl/casino.json';

// Deployed Program ID on Devnet
export const CASINO_PROGRAM_ID = new PublicKey('8zD2fbTQHQRkdQrNs1f7Sd1ApZaUqN5c9GGZ6tSSy62M');

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

// Use the deployed program's IDL with proper type casting
const CASINO_IDL = CasinoIDL as any as Idl;

// Casino Program Client
export class CasinoProgram {
  private program: Program;
  private connection: Connection;
  private wallet: WalletContextState;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection;
    this.wallet = wallet;

    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!wallet.signTransaction) {
        throw new Error('Wallet does not support signing transactions.');
      }

      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      this.program = new Program(CASINO_IDL as Idl, CASINO_PROGRAM_ID, provider);
    } catch (error: any) {
      console.error('Error initializing Casino Program:', error);
      // Throw the actual error message instead of generic one
      throw error;
    }
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
    try {
      const casino = await this.program.account.casino.fetch(casinoPDA);
      return {
        authority: casino.authority,
        totalWagered: (casino.totalWagered as any).toNumber() / LAMPORTS_PER_SOL,
        totalPayout: (casino.totalPayout as any).toNumber() / LAMPORTS_PER_SOL,
        houseEdge: casino.houseEdge,
        minBet: (casino.minBet as any).toNumber() / LAMPORTS_PER_SOL,
        maxBet: (casino.maxBet as any).toNumber() / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error('Error fetching casino state:', error);
      throw new Error('Casino not initialized. Please initialize first.');
    }
  }

  // Get Vault Balance
  async getVaultBalance(): Promise<number> {
    const vaultPDA = getVaultPDA();
    const balance = await this.connection.getBalance(vaultPDA);
    return balance / LAMPORTS_PER_SOL;
  }

  // Fund Vault (admin only)
  async fundVault(amount: number): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    const amountLamports = new BN(amount * LAMPORTS_PER_SOL);

    const tx = await this.program.methods
      .fundVault(amountLamports)
      .accounts({
        casino: getCasinoPDA(),
        vault: getVaultPDA(),
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
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

