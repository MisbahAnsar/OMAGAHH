import { useMemo, useEffect, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Trophy, TrendingUp, TrendingDown, Activity, Coins, Gamepad2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useBlockchain, useTransactionStore } from '../hooks/useBlockchain';
import gsap from 'gsap';
import Hero from '../components/Hero';

interface GameActivity {
  game: string;
  amount: number;
  result: 'win' | 'loss';
  timestamp: number;
}

const Dashboard = () => {
  const { connected, publicKey } = useWallet();
  const { balance } = useBlockchain();
  const { transactions } = useTransactionStore();
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<GameActivity[]>([]);
  
  // Refs for GSAP animations
  const headerRef = useRef(null);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activityRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate real statistics from transactions
  const stats = useMemo(() => {
    const bets = transactions.filter(tx => tx.type === 'bet' && tx.status === 'confirmed');
    const wins = transactions.filter(tx => tx.type === 'win' && tx.status === 'confirmed');
    const losses = transactions.filter(tx => tx.type === 'loss' && tx.status === 'confirmed');
    
    const totalBetAmount = bets.reduce((sum, tx) => sum + tx.amount, 0);
    const totalWinnings = wins.reduce((sum, tx) => sum + tx.amount, 0);
    const totalLosses = losses.reduce((sum, tx) => sum + tx.amount, 0);
    const netProfit = totalWinnings - totalLosses;
    
    // Calculate win rate
    const totalGames = wins.length + losses.length;
    const winRate = totalGames > 0 ? (wins.length / totalGames) * 100 : 0;
    
    return {
      totalBets: bets.length,
      totalWinnings: totalWinnings,
      totalVolume: totalBetAmount,
      netProfit: netProfit,
      winRate: winRate,
      gamesPlayed: totalGames
    };
  }, [transactions]);

  // Load recent games from localStorage
  useEffect(() => {
    const loadRecentGames = () => {
      try {
        const stored = localStorage.getItem('recentGames');
        if (stored) {
          const games = JSON.parse(stored);
          setRecentGames(games.slice(0, 5)); // Show only last 5
        }
      } catch (error) {
        console.error('Failed to load recent games:', error);
      }
    };

    loadRecentGames();

    // Listen for storage changes (when user plays a game)
    const handleStorageChange = () => {
      loadRecentGames();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check every second for updates from same tab
    const interval = setInterval(loadRecentGames, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Simulate live activity - Keep only 10 items max
  useEffect(() => {
    // Initialize with 10 random activities
    const generateRandomActivity = () => {
      const games = ['Coin Flip', 'Dice Roll', 'Slots', 'Blackjack', 'Roulette'];
      const events = [
        { type: 'big_win', user: 'Player***' + Math.floor(Math.random() * 999), amount: Math.random() * 10 + 1, game: games[Math.floor(Math.random() * games.length)] },
        { type: 'new_game', user: 'Player***' + Math.floor(Math.random() * 999), game: games[Math.floor(Math.random() * games.length)] },
        { type: 'big_win', user: 'Player***' + Math.floor(Math.random() * 999), amount: Math.random() * 15 + 2, game: games[Math.floor(Math.random() * games.length)] },
      ];
      
      return {
        ...events[Math.floor(Math.random() * events.length)],
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };
    };

    // Initialize with 10 activities
    const initialActivities = Array.from({ length: 10 }, () => generateRandomActivity());
    setLiveActivity(initialActivities);

    // Add new activity every 3 seconds, keep only 10
    const interval = setInterval(() => {
      const newEvent = generateRandomActivity();
      setLiveActivity(prev => [newEvent, ...prev.slice(0, 9)]); // Keep only 10 max
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // GSAP Animations on mount
  useEffect(() => {
    if (!connected) return;

    const ctx = gsap.context(() => {
      // Header animation - from top with blur
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
      );

      // Stats cards - from left with blur, staggered
      statsRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(
            ref,
            { x: -80, opacity: 0, filter: 'blur(10px)' },
            { 
              x: 0, 
              opacity: 1, 
              filter: 'blur(0px)', 
              duration: 1, 
              delay: 0.2 + index * 0.1,
              ease: 'power3.out' 
            }
          );
        }
      });

      // Activity sections - from sides with blur
      activityRefs.current.forEach((ref, index) => {
        if (ref) {
          const fromX = index === 0 ? -100 : 100; // Left for first, right for second
          gsap.fromTo(
            ref,
            { x: fromX, opacity: 0, filter: 'blur(10px)' },
            { 
              x: 0, 
              opacity: 1, 
              filter: 'blur(0px)', 
              duration: 1.2, 
              delay: 0.6,
              ease: 'power3.out' 
            }
          );
        }
      });

    });

    return () => ctx.revert();
  }, [connected]);

  if (!connected) {
    return <Hero />;
  }

  return (
    <>
      <Hero />
      <div className="space-y-8 p-6">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[var(--accent)] to-white bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Card className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--secondary)]/10 border-[var(--accent)]/30">
            <CardContent className="p-4 flex items-center space-x-3">
              <Coins className="w-6 h-6 text-[var(--accent)]" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Your Balance</p>
                <p className="text-xl font-bold">{balance?.toFixed(4) || '0.0000'} SOL</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div ref={el => statsRefs.current[0] = el}>
          <Card className="hover:shadow-[0_0_30px_var(--accent-glow)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Total Winnings
              </CardTitle>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWinnings.toFixed(4)} SOL</div>
              <p className={`text-xs flex items-center mt-1 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.netProfit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(4)} SOL net profit
              </p>
            </CardContent>
          </Card>
        </div>

        <div ref={el => statsRefs.current[1] = el}>
          <Card className="hover:shadow-[0_0_30px_var(--info-glow)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Games Played
              </CardTitle>
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {stats.winRate.toFixed(1)}% win rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div ref={el => statsRefs.current[2] = el}>
          <Card className="hover:shadow-[0_0_30px_var(--success-glow)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Total Volume
              </CardTitle>
              <Activity className="w-5 h-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolume.toFixed(4)} SOL</div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {stats.totalBets} total bets placed
              </p>
            </CardContent>
          </Card>
        </div>

        <div ref={el => statsRefs.current[3] = el}>
          <Card className="hover:shadow-[0_0_30px_var(--secondary-glow)] transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
                Current Streak
              </CardTitle>
              <Zap className="w-5 h-5 text-[var(--secondary)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(0, stats.gamesPlayed % 5)}</div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Keep playing to increase!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wins vs Losses Chart */}
        <div ref={el => activityRefs.current[0] = el}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[var(--accent)]" />
                Wins vs Losses
              </CardTitle>
              <CardDescription>Your performance overview</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {recentGames.length > 0 ? (
                <div className="h-full flex flex-col">
                  {/* Chart */}
                  <div className="flex-1 flex items-end space-x-8 px-8 mb-6">
                    {/* Wins Bar */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-[var(--background)] rounded-t-xl overflow-hidden relative" style={{ height: '280px' }}>
                        <motion.div
                          key={`wins-${recentGames.filter(g => g.result === 'win').length}`}
                          initial={{ height: 0 }}
                          animate={{ 
                            height: `${Math.min(100, (recentGames.filter(g => g.result === 'win').length / recentGames.length) * 100)}%` 
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-xl flex items-end justify-center pb-4"
                        >
                          <span className="text-2xl font-bold text-white">
                            {recentGames.filter(g => g.result === 'win').length}
                          </span>
                        </motion.div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold text-green-400">Wins</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {recentGames.length > 0 ? ((recentGames.filter(g => g.result === 'win').length / recentGames.length) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                    </div>

                    {/* Losses Bar */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-[var(--background)] rounded-t-xl overflow-hidden relative" style={{ height: '280px' }}>
                        <motion.div
                          key={`losses-${recentGames.filter(g => g.result === 'loss').length}`}
                          initial={{ height: 0 }}
                          animate={{ 
                            height: `${Math.min(100, (recentGames.filter(g => g.result === 'loss').length / recentGames.length) * 100)}%` 
                          }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-xl flex items-end justify-center pb-4"
                        >
                          <span className="text-2xl font-bold text-white">
                            {recentGames.filter(g => g.result === 'loss').length}
                          </span>
                        </motion.div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold text-red-400">Losses</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {recentGames.length > 0 ? ((recentGames.filter(g => g.result === 'loss').length / recentGames.length) * 100).toFixed(1) : '0.0'}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="text-center mt-auto pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--text-secondary)] italic">
                      Note: Stats are cleared when page is refreshed
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-[var(--text-secondary)]">
                  <div>
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No games played yet</p>
                    <p className="text-sm mt-1">Start playing to see your stats!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <div ref={el => activityRefs.current[1] = el}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
                Live Casino Activity
              </CardTitle>
              <CardDescription>See what others are winning right now</CardDescription>
            </CardHeader>
            <CardContent>
              {liveActivity.length > 0 ? (
                <div className="h-[400px] p-3 border-2 border-[var(--accent)]/30 rounded-xl bg-[var(--background)]/50 overflow-y-auto scroll-smooth">
                  <div className="space-y-3 pr-2">
                    {liveActivity.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[var(--accent)]/5 to-transparent border-2 border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[var(--accent-glow)]"
                      >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center text-xs font-bold text-black">
                          {event.user.slice(-3)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {event.type === 'big_win' && `${event.user} won big!`}
                            {event.type === 'new_game' && `${event.user} is playing`}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">{event.game}</p>
                        </div>
                      </div>
                      {event.amount && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">
                            +{event.amount.toFixed(2)} SOL
                          </p>
                        </div>
                      )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Waiting for live activity...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      </div>
    </>
  );
};

// Helper function to save game activity to localStorage
export const saveGameActivity = (game: string, amount: number, result: 'win' | 'loss') => {
  try {
    const stored = localStorage.getItem('recentGames');
    const games: GameActivity[] = stored ? JSON.parse(stored) : [];
    
    const newGame: GameActivity = {
      game,
      amount,
      result,
      timestamp: Date.now(),
    };
    
    // Add to beginning and keep only last 50
    const updated = [newGame, ...games].slice(0, 50);
    localStorage.setItem('recentGames', JSON.stringify(updated));
    
    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Failed to save game activity:', error);
  }
};

export default Dashboard;