import { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Connection
} from '@solana/web3.js';
import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { CasinoProgram, CASINO_PROGRAM_ID } from '../lib/casino-program';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import CasinoIDL from '../idl/casino.json';

// Fee recipient wallet address (receives 1% of all transactions)
const FEE_RECIPIENT_ADDRESS = 'GeG6GYJCB4jRnNkztjyd29F6NgBVr1vJ83bwrxJD1S67';
const FEE_PERCENTAGE = 0.01; // 1%

// Store for transaction history
interface TransactionState {
  transactions: Array<{
    signature: string;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    amount: number;
    feeAmount?: number;
    type: 'bet' | 'win' | 'loss' | 'deposit' | 'withdraw' | 'fee';
    game?: string;
    recipient?: string;
  }>;
  addTransaction: (tx: {
    signature: string;
    status: 'pending' | 'confirmed' | 'failed';
    amount: number;
    feeAmount?: number;
    type: 'bet' | 'win' | 'loss' | 'deposit' | 'withdraw' | 'fee';
    game?: string;
    recipient?: string;
  }) => void;
  updateTransactionStatus: (signature: string, status: 'pending' | 'confirmed' | 'failed') => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  addTransaction: (tx) => set((state) => ({
    transactions: [
      {
        ...tx,
        timestamp: Date.now(),
      },
      ...state.transactions
    ]
  })),
  updateTransactionStatus: (signature, status) => set((state) => ({
    transactions: state.transactions.map(tx =>
      tx.signature === signature ? { ...tx, status } : tx
    )
  }))
}));

export const useBlockchain = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, signTransaction } = wallet;
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const { addTransaction, updateTransactionStatus } = useTransactionStore();

  // Initialize casino program client
  const casinoProgram = useMemo(() => {
    if (!publicKey || !signTransaction) return null;
    try {
      return new CasinoProgram(connection, wallet);
    } catch (error) {
      console.error('Failed to create Casino Program instance:', error);
      return null;
    }
  }, [connection, wallet, publicKey, signTransaction]);

  // Memoized connection status
  const isConnected = useMemo(() => !!publicKey, [publicKey]);

  // Memoized program instance
  const program = useMemo(() => {
    if (!publicKey || !signTransaction) return null;

    try {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction } as any,
        { commitment: 'confirmed' }
      );

      return new Program(CasinoIDL as any, CASINO_PROGRAM_ID, provider);
    } catch (error) {
      console.error('Failed to create program instance:', error);
      return null;
    }
  }, [connection, publicKey, signTransaction]);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return null;
    }

    try {
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setBalance(solBalance);
      return solBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }, [connection, publicKey]);

  // Place a bet using casino program
  const placeBet = useCallback(async (
    amount: number,
    gameId: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!publicKey || !amount || amount <= 0 || !casinoProgram) {
      throw new Error('Invalid bet parameters or wallet not connected');
    }

    setIsLoading(true);

    try {
      let signature: string;
      let gameResult: any;

      // Call the appropriate game function based on gameId
      if (gameId === 'coinflip') {
        const prediction = metadata.choice as 'heads' | 'tails';
        signature = await casinoProgram.playCoinFlip(amount, prediction);
        
        // Wait for confirmation and parse result
        await connection.confirmTransaction(signature, 'confirmed');
        gameResult = await casinoProgram.parseGameResult(signature);
        
        // Add to transaction history
        addTransaction({
          signature,
          status: 'confirmed',
          amount: gameResult.won ? amount * 1.95 : amount,
          type: gameResult.won ? 'win' : 'loss',
          game: gameId
        });

      } else if (gameId === 'dice') {
        const targetNumber = metadata.targetNumber || 3;
        const isOver = metadata.isOver || false;
        signature = await casinoProgram.playDiceRoll(amount, targetNumber, isOver);
        
        await connection.confirmTransaction(signature, 'confirmed');
        gameResult = await casinoProgram.parseGameResult(signature);
        
        addTransaction({
          signature,
          status: 'confirmed',
          amount: gameResult.won ? amount * 2 : amount, // Simplified multiplier
          type: gameResult.won ? 'win' : 'loss',
          game: gameId
        });

      } else if (gameId === 'slots') {
        signature = await casinoProgram.playSlots(amount);
        
        await connection.confirmTransaction(signature, 'confirmed');
        gameResult = await casinoProgram.parseGameResult(signature);
        
        addTransaction({
          signature,
          status: 'confirmed',
          amount: gameResult.won ? amount * 2 : amount, // Actual payout varies
          type: gameResult.won ? 'win' : 'loss',
          game: gameId
        });

      } else {
        throw new Error('Unknown game type');
      }

      // Update balance after game
      await fetchBalance();

      // Show result notification
      if (gameResult.won) {
        toast.success(`🎉 You won! Check your wallet`, {
          duration: 5000,
        });
      } else {
        toast.error(`Better luck next time!`, {
          duration: 3000,
        });
      }

      return {
        success: true,
        won: gameResult.won,
        signature,
        metadata: {
          ...metadata,
          result: gameResult
        }
      };
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast.error(error.message || 'Transaction failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, casinoProgram, addTransaction, fetchBalance]);

  // Initialize and refresh balance
  useEffect(() => {
    fetchBalance();

    // Refresh balance every 15 seconds
    const intervalId = setInterval(fetchBalance, 15000);

    return () => clearInterval(intervalId);
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    placeBet,
    fetchBalance
  };
};
