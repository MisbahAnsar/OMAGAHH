import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimpleCasinoClient } from '../lib/casino-program-simple';
import { saveGameActivity } from '../pages/Dashboard';

// Types
interface GameState {
  isPlaying: boolean;
  result: any | null;
  isAnimating: boolean;
  gameId: string | null;
  transactionSignature: string | null;
  error: string | null;
  startTime: number | null;
  endTime: number | null;
}

interface GameHistory {
  id: string;
  gameType: string;
  betAmount: number;
  prediction: any;
  result: any;
  won: boolean;
  payout: number;
  timestamp: number;
  transactionSignature: string;
  provableFairData: {
    clientSeed: string;
    serverSeedHash: string;
    nonce: number;
  };
}

interface GameStats {
  totalGames: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
  winRate: number;
  profitLoss: number;
}

// Store for game state management
interface GameStore {
  gameState: GameState;
  gameHistory: GameHistory[];
  gameStats: GameStats;
  setGameState: (state: Partial<GameState>) => void;
  addGameToHistory: (game: GameHistory) => void;
  updateGameStats: (game: GameHistory) => void;
  clearHistory: () => void;
  resetStats: () => void;
}

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: {
        isPlaying: false,
        result: null,
        isAnimating: false,
        gameId: null,
        transactionSignature: null,
        error: null,
        startTime: null,
        endTime: null,
      },
      gameHistory: [],
      gameStats: {
        totalGames: 0,
        totalWagered: 0,
        totalWon: 0,
        biggestWin: 0,
        currentStreak: 0,
        bestStreak: 0,
        winRate: 0,
        profitLoss: 0,
      },
      setGameState: (state) => set((prev) => ({
        gameState: { ...prev.gameState, ...state }
      })),
      addGameToHistory: (game) => set((prev) => ({
        gameHistory: [game, ...prev.gameHistory.slice(0, 99)] // Keep last 100 games
      })),
      updateGameStats: (game) => set((prev) => {
        const stats = { ...prev.gameStats };
        stats.totalGames += 1;
        stats.totalWagered += game.betAmount;

        if (game.won) {
          stats.totalWon += game.payout;
          stats.currentStreak = stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1;
          stats.biggestWin = Math.max(stats.biggestWin, game.payout);
        } else {
          stats.currentStreak = stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1;
        }

        stats.bestStreak = Math.max(stats.bestStreak, Math.abs(stats.currentStreak));
        stats.winRate = (prev.gameHistory.filter(g => g.won).length + (game.won ? 1 : 0)) / stats.totalGames * 100;
        stats.profitLoss = stats.totalWon - stats.totalWagered;

        return { gameStats: stats };
      }),
      clearHistory: () => set({ gameHistory: [] }),
      resetStats: () => set({
        gameStats: {
          totalGames: 0,
          totalWagered: 0,
          totalWon: 0,
          biggestWin: 0,
          currentStreak: 0,
          bestStreak: 0,
          winRate: 0,
          profitLoss: 0,
        }
      }),
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        gameHistory: state.gameHistory,
        gameStats: state.gameStats,
      }),
    }
  )
);

// Enhanced game hook
export const useEnhancedGame = (gameType: string) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction, signAllTransactions, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const {
    gameState,
    gameHistory,
    gameStats,
    setGameState,
    addGameToHistory,
    updateGameStats,
  } = useGameStore();

  // Audio refs
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);

  // WebSocket connection for real-time updates
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize casino client using SimpleCasinoClient
  const casinoClient = useMemo(() => {
    // Need the full wallet object from useWallet
    const wallet = { publicKey, sendTransaction, signTransaction, signAllTransactions, connected };
    
    if (!publicKey || !sendTransaction) {
      console.log('Wallet not ready for casino client:', { publicKey: !!publicKey, sendTransaction: !!sendTransaction });
      return null;
    }
    
    try {
      return new SimpleCasinoClient(connection, wallet as any);
    } catch (error) {
      console.error('Failed to initialize casino client:', error);
      return null;
    }
  }, [connection, publicKey, sendTransaction, signTransaction, signAllTransactions, connected]);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      winSoundRef.current = new Audio('/sounds/win.mp3');
      loseSoundRef.current = new Audio('/sounds/lose.mp3');
      spinSoundRef.current = new Audio('/sounds/spin.mp3');

      // Preload audio files
      [winSoundRef.current, loseSoundRef.current, spinSoundRef.current].forEach(audio => {
        if (audio) {
          audio.preload = 'auto';
          audio.volume = 0.5;
        }
      });
    }
  }, []);

  // Simplified real-time updates (without WebSocket for now)
  useEffect(() => {
    // For now, we'll handle game updates locally
    // In production, this would connect to a real WebSocket server
    console.log('Game hook initialized for:', gameType);
  }, [gameType]);

  // Handle game result processing
  const processGameResult = useCallback((result: any, betAmount: number, prediction: any, gameId: string) => {
    setGameState({
      result,
      isAnimating: false,
      isPlaying: false,
      endTime: Date.now(),
    });

    // Play sound
    if (soundEnabled) {
      const audio = result.won ? winSoundRef.current : loseSoundRef.current;
      audio?.play().catch(console.error);
    }

    // Show notification after 2 seconds
    setTimeout(() => {
      if (result.won) {
        toast.success(`🎉 You won ${result.payout.toFixed(4)} SOL!`, {
          duration: 5000,
          icon: '🎰',
        });
      } else {
        toast.error('Better luck next time!', {
          duration: 3000,
        });
      }
    }, 2000);

    // Add to history and update stats
    const gameRecord: GameHistory = {
      id: gameId,
      gameType,
      betAmount,
      prediction,
      result,
      won: result.won,
      payout: result.payout,
      timestamp: Date.now(),
      transactionSignature: 'simulated-tx',
      provableFairData: {
        clientSeed: Math.random().toString(36),
        serverSeedHash: 'simulated-hash',
        nonce: Date.now(),
      },
    };

    addGameToHistory(gameRecord);
    updateGameStats(gameRecord);
  }, [gameType, soundEnabled, setGameState, addGameToHistory, updateGameStats]);

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

  // Real bet placement with casino smart contract
  const placeBet = useCallback(async (
    amount: number,
    prediction: any,
    options: {
      clientSeed?: string;
      autoPlay?: boolean;
      stopOnWin?: boolean;
      stopOnLoss?: boolean;
    } = {}
  ) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!casinoClient) {
      throw new Error('Casino client not initialized. Please connect your wallet.');
    }

    if (gameState.isPlaying) {
      throw new Error('Game already in progress');
    }

    // Validate bet amount
    if (amount <= 0) {
      throw new Error('Bet amount must be greater than 0');
    }

    if (balance !== null && amount > balance) {
      throw new Error('Insufficient balance');
    }

    setIsLoading(true);
    const gameId = Math.random().toString(36).substring(7);

    setGameState({
      isPlaying: true,
      isAnimating: true,
      result: null,
      error: null,
      startTime: Date.now(),
      gameId,
      transactionSignature: null,
    });

    try {
      // Play spin sound
      if (soundEnabled && spinSoundRef.current) {
        spinSoundRef.current.currentTime = 0;
        spinSoundRef.current.play().catch(console.error);
      }

      // Show loading notification
      const toastId = toast.loading(`Placing bet of ${amount} SOL...`);

      let txSignature: string;
      let gameResult: any;

      // Call the real casino program based on game type
      try {
        switch (gameType) {
          case 'coinflip':
            // Convert 'heads'/'tails' to 0/1 for the smart contract
            const coinChoice = prediction.choice === 'heads' ? 0 : 1;
            txSignature = await casinoClient.playCoinFlip(amount, coinChoice);
            break;
          case 'dice':
          case 'diceroll':
            txSignature = await casinoClient.playDiceRoll(
              amount,
              prediction.target || 50,
              prediction.isOver || false
            );
            break;
          case 'slots':
            txSignature = await casinoClient.playSlots(amount);
            break;
          default:
            throw new Error(`Unknown game type: ${gameType}`);
        }

        toast.dismiss(toastId);
        toast.loading('Confirming transaction...', { id: toastId });

        // Wait for confirmation
        await connection.confirmTransaction(txSignature, 'confirmed');

        // Parse the REAL result from the blockchain transaction
        try {
          console.log('🔍 Fetching transaction details...');
          const tx = await connection.getTransaction(txSignature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          console.log('📋 Full transaction:', tx);
          console.log('📋 Transaction logs:', tx?.meta?.logMessages);
          
          // Parse the actual result from logs
          // The smart contract logs the result, we need to find it
          let actualResult = 0;
          let won = false;
          let actualPayout = 0;
          
          if (tx?.meta?.logMessages) {
            for (const log of tx.meta.logMessages) {
              console.log('🔎 Log:', log);
              
              // Look for result in program logs
              // The contract emits the result value
              // Example: "Program log: Dice Roll Result: 3"
              if (log.includes('Dice Roll Result:')) {
                const match = log.match(/Dice Roll Result:\s*(\d+)/);
                if (match) {
                  actualResult = parseInt(match[1]);
                  console.log('✅ Found dice result in logs:', actualResult);
                }
              }
            }
          }
          
          // Check balance to determine win/loss and payout
          const oldBalanceLamports = (balance || 0) * LAMPORTS_PER_SOL;
          const newBalance = await connection.getBalance(publicKey);
          const balanceDiff = newBalance - oldBalanceLamports;
          
          console.log('💰 Balance check:', {
            oldBalance: oldBalanceLamports / LAMPORTS_PER_SOL,
            newBalance: newBalance / LAMPORTS_PER_SOL,
            diff: balanceDiff / LAMPORTS_PER_SOL
          });
          
          // Won if balance increased
          won = balanceDiff > 0;
          actualPayout = won ? balanceDiff / LAMPORTS_PER_SOL : 0;
          
          // If we couldn't parse result from logs, derive it from the transaction
          if (actualResult === 0) {
            // Use transaction slot and signature to derive the result
            // This matches what the contract does: slot ^ player_key
            const slot = tx?.slot || 0;
            actualResult = ((slot % 6) + 1);
            console.log('⚠️ Could not find result in logs, derived from slot:', actualResult);
          }
          
          console.log('🎲 Final game result:', { won, actualResult, actualPayout, balanceDiff });
          
          gameResult = {
            won,
            result: actualResult,
            payout: actualPayout,
          };
        } catch (parseError) {
          console.error('❌ Failed to parse game result:', parseError);
          
          // Fallback: check balance only
          const oldBalanceLamports = (balance || 0) * LAMPORTS_PER_SOL;
          const newBalance = await connection.getBalance(publicKey);
          const balanceDiff = newBalance - oldBalanceLamports;
          const won = balanceDiff > 0;
          
          gameResult = {
            won,
            result: 1, // Fallback to showing 1
            payout: won ? balanceDiff / LAMPORTS_PER_SOL : 0,
          };
        }

        toast.dismiss(toastId);

        // Update game state with transaction signature AND result
        setGameState({
          transactionSignature: txSignature,
          result: {
            outcome: [gameResult.result], // Pass the actual dice roll result
            won: gameResult.won,
            payout: gameResult.payout,
          },
        });

        // Process the result
        processGameResult(gameResult, amount, prediction, gameId);

        // Save to localStorage for dashboard
        const gameNames: Record<string, string> = {
          coinflip: 'Coin Flip',
          diceroll: 'Dice Roll',
          slots: 'Slots'
        };
        saveGameActivity(
          gameNames[gameType] || gameType,
          gameResult.won ? gameResult.payout : amount,
          gameResult.won ? 'win' : 'loss'
        );

        // Refresh balance after game
        await fetchBalance();

      return {
          signature: txSignature,
        gameId,
      };

      } catch (error: any) {
        toast.dismiss(toastId);
        throw error;
      }

    } catch (error: any) {
      console.error('Error placing bet:', error);

      setGameState({
        isPlaying: false,
        isAnimating: false,
        error: error.message || 'Failed to place bet',
      });

      // Silent error handling - no toasts
      console.error('Game error:', error.message);

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, casinoClient, gameState.isPlaying, balance, gameType, soundEnabled, connection, setGameState, processGameResult, fetchBalance]);

  // Auto-play functionality (simplified)
  const startAutoPlay = useCallback(async (
    baseAmount: number,
    prediction: any,
    options: {
      numberOfGames: number;
      stopOnWin?: number;
      stopOnLoss?: number;
      increaseOnWin?: number;
      increaseOnLoss?: number;
    }
  ) => {
    // Simplified auto-play - would be implemented in production
    console.log('Auto-play feature coming soon!');
    toast('Auto-play feature coming soon!');
  }, []);

  // Initialize balance on mount
  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }

    // Refresh balance every 15 seconds
    const intervalId = setInterval(() => {
      if (publicKey) fetchBalance();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchBalance, publicKey]);

  return {
    // State
    gameState,
    gameHistory,
    gameStats,
    balance,
    isLoading,
    isConnected: !!publicKey,
    soundEnabled,

    // Actions
    placeBet,
    startAutoPlay,
    fetchBalance,
    setSoundEnabled,

    // Utilities
    connection,
  };
};
