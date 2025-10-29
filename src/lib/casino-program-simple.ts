/**
 * Simplified casino program client that works around IDL issues
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';

export const CASINO_PROGRAM_ID = new PublicKey('8zD2fbTQHQRkdQrNs1f7Sd1ApZaUqN5c9GGZ6tSSy62M');

// Get Casino PDA
export function getCasinoPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('casino')],
    CASINO_PROGRAM_ID
  );
  return pda;
}

// Get Vault PDA
export function getVaultPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    CASINO_PROGRAM_ID
  );
  return pda;
}

// Instruction discriminators (first 8 bytes of SHA256("global:instruction_name"))
const INSTRUCTION_DISCRIMINATORS = {
  initialize: Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]),
  fundVault: Buffer.from([26, 33, 207, 242, 119, 108, 134, 73]),
  playCoinFlip: Buffer.from([221, 213, 139, 239, 108, 34, 18, 12]),
  playDiceRoll: Buffer.from([111, 158, 153, 47, 87, 64, 11, 126]),
  playSlots: Buffer.from([143, 50, 70, 130, 212, 96, 69, 23]),
};

/**
 * Simplified Casino Client that builds instructions manually
 */
export class SimpleCasinoClient {
  constructor(
    private connection: Connection,
    private wallet: WalletContextState
  ) {}

  /**
   * Initialize the casino (one-time setup)
   */
  async initialize(): Promise<string> {
    console.log('🔍 Checking wallet state...');
    console.log('Wallet object:', this.wallet);
    console.log('Wallet.publicKey:', this.wallet.publicKey);
    console.log('Wallet.connected:', this.wallet.connected);
    
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected - publicKey is null');
    }

    if (!this.wallet.sendTransaction) {
      throw new Error('Wallet does not support sendTransaction');
    }

    if (!this.wallet.connected) {
      throw new Error('Wallet is not connected');
    }

    const casinoPDA = getCasinoPDA();
    const vaultPDA = getVaultPDA();

    console.log('✅ Wallet is connected');
    console.log('Initialize - Program ID:', CASINO_PROGRAM_ID.toString());
    console.log('Initialize - Casino PDA:', casinoPDA.toString());
    console.log('Initialize - Vault PDA:', vaultPDA.toString());
    console.log('Initialize - Authority (your wallet):', this.wallet.publicKey.toString());
    console.log('Initialize - System Program:', SystemProgram.programId.toString());
    
    // Double check the address isn't the same as program ID
    if (this.wallet.publicKey.toString() === CASINO_PROGRAM_ID.toString()) {
      throw new Error('ERROR: Your wallet address is showing as the program ID! This should not happen. Please disconnect and reconnect your wallet.');
    }

    // Build initialize instruction
    const instruction = new TransactionInstruction({
      programId: CASINO_PROGRAM_ID,
      keys: [
        { pubkey: casinoPDA, isSigner: false, isWritable: true },
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: INSTRUCTION_DISCRIMINATORS.initialize,
    });

    console.log('📦 Transaction instruction created');
    console.log('Instruction keys:', instruction.keys.map(k => ({
      pubkey: k.pubkey.toString(),
      isSigner: k.isSigner,
      isWritable: k.isWritable
    })));

    // Create transaction
    const transaction = new Transaction().add(instruction);

    try {
      console.log('📤 Sending transaction...');
      // Use wallet adapter's sendTransaction (handles signing + sending)
      const signature = await this.wallet.sendTransaction(transaction, this.connection);

      console.log('✅ Transaction sent! Signature:', signature);
      console.log('⏳ Waiting for confirmation...');

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ Transaction confirmed!');
      return signature;
    } catch (error: any) {
      console.error('❌ Transaction failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        logs: error.logs,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Fund the casino vault
   */
  async fundVault(amount: number): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.sendTransaction) {
      throw new Error('Wallet not connected or does not support sendTransaction');
    }

    const casinoPDA = getCasinoPDA();
    const vaultPDA = getVaultPDA();

    // Serialize amount as u64 (8 bytes, little-endian)
    const amountBuffer = Buffer.alloc(8);
    const amountBN = new BN(amount * LAMPORTS_PER_SOL);
    amountBN.toArrayLike(Buffer, 'le', 8).copy(amountBuffer);

    // Combine discriminator + amount
    const data = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.fundVault,
      amountBuffer,
    ]);

    console.log('Fund Vault - Amount:', amount, 'SOL');
    console.log('Fund Vault - Casino PDA:', casinoPDA.toString());
    console.log('Fund Vault - Vault PDA:', vaultPDA.toString());

    const instruction = new TransactionInstruction({
      programId: CASINO_PROGRAM_ID,
      keys: [
        { pubkey: casinoPDA, isSigner: false, isWritable: false },
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const transaction = new Transaction().add(instruction);

    // Use wallet adapter's sendTransaction
    const signature = await this.wallet.sendTransaction(transaction, this.connection);

    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }

  /**
   * Play Coin Flip
   */
  async playCoinFlip(betAmount: number, prediction: number): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.sendTransaction) {
      throw new Error('Wallet not connected');
    }

    const casinoPDA = getCasinoPDA();
    const vaultPDA = getVaultPDA();

    // Log the bet amount being sent
    console.log('🪙 Coin Flip - Bet Amount (SOL):', betAmount);
    console.log('🪙 Coin Flip - Bet Amount (Lamports):', betAmount * LAMPORTS_PER_SOL);
    console.log('🪙 Coin Flip - Prediction:', prediction === 0 ? 'Heads' : 'Tails');
    console.log('🪙 Smart Contract Min Bet: 0.01 SOL (10,000,000 lamports)');
    console.log('🪙 Smart Contract Max Bet: 10 SOL (10,000,000,000 lamports)');

    // Validate bet amount on frontend
    if (betAmount < 0.01) {
      throw new Error(`Bet too low! Minimum bet is 0.01 SOL. You tried to bet ${betAmount} SOL`);
    }
    if (betAmount > 10) {
      throw new Error(`Bet too high! Maximum bet is 10 SOL. You tried to bet ${betAmount} SOL`);
    }

    // Serialize: bet_amount (u64) + prediction (u8)
    const betAmountBuffer = Buffer.alloc(8);
    const lamports = Math.floor(betAmount * LAMPORTS_PER_SOL);
    new BN(lamports).toArrayLike(Buffer, 'le', 8).copy(betAmountBuffer);
    
    const predictionBuffer = Buffer.alloc(1);
    predictionBuffer.writeUInt8(prediction, 0);

    const data = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.playCoinFlip,
      betAmountBuffer,
      predictionBuffer,
    ]);

    console.log('🪙 Wallet balance check...');
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      console.log('🪙 Current wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      
      if (balance < lamports) {
        throw new Error(`Insufficient balance! Have ${balance / LAMPORTS_PER_SOL} SOL, need ${betAmount} SOL`);
      }
    } catch (error: any) {
      console.error('🪙 Balance check failed:', error);
    }

    const instruction = new TransactionInstruction({
      programId: CASINO_PROGRAM_ID,
      keys: [
        { pubkey: casinoPDA, isSigner: false, isWritable: true },
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    console.log('🪙 Creating transaction...');
    const transaction = new Transaction().add(instruction);
    
    console.log('🪙 Waiting for wallet approval...');
    console.log('⚠️  CHECK YOUR WALLET - You should see an approval popup!');
    
    try {
      // This will trigger the wallet approval popup
      const signature = await this.wallet.sendTransaction(transaction, this.connection);
      console.log('✅ Transaction approved and sent! Signature:', signature);
      console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      console.log('⏳ Waiting for confirmation...');
      await this.connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transaction confirmed!');
      
      return signature;
    } catch (error: any) {
      console.error('❌ Transaction failed!');
      console.error('❌ Error type:', error.name);
      console.error('❌ Error message:', error.message);
      
      if (error.message?.includes('User rejected')) {
        console.log('ℹ️  You cancelled the transaction');
        throw new Error('Transaction cancelled by user');
      }
      
      throw error;
    }
  }

  /**
   * Play Dice Roll
   */
  async playDiceRoll(betAmount: number, prediction: number, isOver: boolean): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.sendTransaction) {
      throw new Error('Wallet not connected');
    }

    const casinoPDA = getCasinoPDA();
    const vaultPDA = getVaultPDA();

    // Log the bet amount being sent
    console.log('🎲 Dice Roll - Bet Amount (SOL):', betAmount);
    console.log('🎲 Dice Roll - Bet Amount (Lamports):', betAmount * LAMPORTS_PER_SOL);
    console.log('🎲 Dice Roll - Prediction (ORIGINAL):', prediction, 'Is Over:', isOver);
    console.log('🎲 Smart Contract Min Bet: 0.01 SOL (10,000,000 lamports)');
    console.log('🎲 Smart Contract Max Bet: 10 SOL (10,000,000,000 lamports)');
    console.log('🎲 Smart Contract requires: prediction must be 1-6 (dice face)');

    // Validate bet amount on frontend
    if (betAmount < 0.01) {
      throw new Error(`Bet too low! Minimum bet is 0.01 SOL. You tried to bet ${betAmount} SOL`);
    }
    if (betAmount > 10) {
      throw new Error(`Bet too high! Maximum bet is 10 SOL. You tried to bet ${betAmount} SOL`);
    }

    // Convert prediction from percentage (1-99) to dice face (1-6)
    // If prediction is > 6, it's likely a percentage/target number
    let diceFace = prediction;
    if (prediction > 6) {
      // Map 1-99 to 1-6 dice faces
      // For "over/under" game, we need to pick a dice face
      // If isOver=true and target is 50, that means "roll over 3" (50% chance)
      // Convert target percentage to dice face
      diceFace = Math.max(1, Math.min(6, Math.floor(prediction / 100 * 6) || 3));
      console.log(`🎲 Converted prediction ${prediction} to dice face: ${diceFace}`);
    }
    
    // Validate dice face
    if (diceFace < 1 || diceFace > 6) {
      throw new Error(`Invalid dice face! Must be 1-6. Got: ${diceFace}`);
    }
    
    console.log('🎲 Dice Roll - Final Prediction (dice face):', diceFace, 'Is Over:', isOver);

    // Serialize: bet_amount (u64) + prediction (u8) + is_over (bool)
    const betAmountBuffer = Buffer.alloc(8);
    const lamports = Math.floor(betAmount * LAMPORTS_PER_SOL);
    new BN(lamports).toArrayLike(Buffer, 'le', 8).copy(betAmountBuffer);
    
    const predictionBuffer = Buffer.alloc(1);
    predictionBuffer.writeUInt8(diceFace, 0);  // Use diceFace, not prediction

    const isOverBuffer = Buffer.alloc(1);
    isOverBuffer.writeUInt8(isOver ? 1 : 0, 0);

    const data = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.playDiceRoll,
      betAmountBuffer,
      predictionBuffer,
      isOverBuffer,
    ]);

    console.log('🎲 Transaction data length:', data.length);
    console.log('🎲 Wallet balance check...');
    
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      console.log('🎲 Current wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      
      if (balance < lamports) {
        throw new Error(`Insufficient balance! Have ${balance / LAMPORTS_PER_SOL} SOL, need ${betAmount} SOL`);
      }
    } catch (error: any) {
      console.error('🎲 Balance check failed:', error);
    }

    const instruction = new TransactionInstruction({
      programId: CASINO_PROGRAM_ID,
      keys: [
        { pubkey: casinoPDA, isSigner: false, isWritable: true },
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    console.log('🎲 Creating transaction...');
    const transaction = new Transaction().add(instruction);
    
    // Try to simulate the transaction first to catch errors early
    console.log('🎲 Simulating transaction...');
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey;
      
      const simulation = await this.connection.simulateTransaction(transaction);
      console.log('🎲 Simulation result:', simulation);
      
      if (simulation.value.err) {
        console.error('❌ Simulation failed:', simulation.value.err);
        console.error('📋 Simulation logs:', simulation.value.logs);
        throw new Error(`Transaction would fail: ${JSON.stringify(simulation.value.err)}`);
      }
      
      console.log('✅ Simulation successful!');
    } catch (simError: any) {
      console.error('❌ Simulation error:', simError);
      throw new Error(`Simulation failed: ${simError.message}`);
    }
    
    console.log('🎲 Waiting for wallet approval...');
    console.log('⚠️  CHECK YOUR WALLET - You should see an approval popup!');
    
    try {
      // This will trigger the wallet approval popup
      const signature = await this.wallet.sendTransaction(transaction, this.connection);
      console.log('✅ Transaction approved and sent! Signature:', signature);
      console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      console.log('⏳ Waiting for confirmation...');
      await this.connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transaction confirmed!');
      
      return signature;
    } catch (error: any) {
      console.error('❌ Transaction failed!');
      console.error('❌ Error type:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error:', error);
      
      if (error.message?.includes('User rejected')) {
        console.log('ℹ️  You cancelled the transaction');
        throw new Error('Transaction cancelled by user');
      }
      
      throw error;
    }
  }

  /**
   * Play Slots
   */
  async playSlots(betAmount: number): Promise<string> {
    if (!this.wallet.publicKey || !this.wallet.sendTransaction) {
      throw new Error('Wallet not connected');
    }

    const casinoPDA = getCasinoPDA();
    const vaultPDA = getVaultPDA();

    // Serialize: bet_amount (u64)
    const betAmountBuffer = Buffer.alloc(8);
    new BN(betAmount * LAMPORTS_PER_SOL).toArrayLike(Buffer, 'le', 8).copy(betAmountBuffer);

    const data = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.playSlots,
      betAmountBuffer,
    ]);

    const instruction = new TransactionInstruction({
      programId: CASINO_PROGRAM_ID,
      keys: [
        { pubkey: casinoPDA, isSigner: false, isWritable: true },
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await this.wallet.sendTransaction(transaction, this.connection);
    await this.connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }

  /**
   * Get vault balance
   */
  async getVaultBalance(): Promise<number> {
    const vaultPDA = getVaultPDA();
    const balance = await this.connection.getBalance(vaultPDA);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Get casino account data (simplified check if initialized)
   */
  async isInitialized(): Promise<boolean> {
    try {
      const casinoPDA = getCasinoPDA();
      const accountInfo = await this.connection.getAccountInfo(casinoPDA);
      return accountInfo !== null && accountInfo.data.length > 0;
    } catch {
      return false;
    }
  }
}
