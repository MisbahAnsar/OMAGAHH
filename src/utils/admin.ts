/**
 * Admin utilities for managing the casino program
 * These functions should only be called by the casino authority
 */

import { Connection } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SimpleCasinoClient, getCasinoPDA, getVaultPDA } from '../lib/casino-program-simple';

export class CasinoAdmin {
  private client: SimpleCasinoClient;
  private connection: Connection;
  private wallet: WalletContextState;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection;
    this.wallet = wallet;
    this.client = new SimpleCasinoClient(connection, wallet);
  }

  /**
   * Initialize the casino (one-time setup)
   * Must be called by the authority wallet
   */
  async initialize(): Promise<string> {
    console.log('Initializing casino...');
    const txSignature = await this.client.initialize();
    console.log('Casino initialized! Transaction:', txSignature);
    return txSignature;
  }

  /**
   * Fund the casino vault so it can pay out winnings
   * @param amount Amount in SOL to add to the vault
   */
  async fundVault(amount: number): Promise<string> {
    console.log(`Funding vault with ${amount} SOL...`);
    const txSignature = await this.client.fundVault(amount);
    console.log('Vault funded! Transaction:', txSignature);
    return txSignature;
  }

  /**
   * Check if casino is initialized
   */
  async isInitialized(): Promise<boolean> {
    return await this.client.isInitialized();
  }

  /**
   * Get the current vault balance
   */
  async getVaultBalance(): Promise<number> {
    return await this.client.getVaultBalance();
  }

  /**
   * Get the casino and vault PDAs
   */
  getPDAs() {
    return {
      casino: getCasinoPDA().toString(),
      vault: getVaultPDA().toString(),
    };
  }

  /**
   * Full casino setup (initialize + fund)
   * @param initialFunding Amount in SOL to initially fund the vault
   */
  async setupCasino(initialFunding: number = 10): Promise<{
    initTx: string;
    fundTx: string;
  }> {
    console.log('Setting up casino...');
    
    // Step 1: Initialize
    const initTx = await this.initialize();
    console.log('✓ Initialized');

    // Wait a moment for the transaction to settle
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Fund vault
    const fundTx = await this.fundVault(initialFunding);
    console.log('✓ Funded with', initialFunding, 'SOL');

    // Step 3: Verify setup
    const state = await this.getCasinoState();
    const balance = await this.getVaultBalance();

    console.log('\n🎉 Casino setup complete!');
    console.log('Casino state:', state);
    console.log('Vault balance:', balance, 'SOL');

    return { initTx, fundTx };
  }

  /**
   * Get casino statistics
   */
  async getStatistics() {
    const state = await this.getCasinoState();
    const vaultBalance = await this.getVaultBalance();

    return {
      totalWagered: state.totalWagered,
      totalPayout: state.totalPayout,
      houseProfit: state.totalWagered - state.totalPayout,
      vaultBalance,
      houseEdge: state.houseEdge / 100, // Convert basis points to percentage
      minBet: state.minBet,
      maxBet: state.maxBet,
    };
  }
}

/**
 * Quick setup function for development/testing
 * Call this from the browser console when connected with admin wallet
 */
export async function quickSetupCasino(
  connection: Connection,
  wallet: WalletContextState,
  fundingAmount: number = 10
) {
  const admin = new CasinoAdmin(connection, wallet);
  return await admin.setupCasino(fundingAmount);
}

