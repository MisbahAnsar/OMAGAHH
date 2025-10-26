import React, { useMemo, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Trophy, Users, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Coins, Gamepad2, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useBlockchain, useTransactionStore } from '../hooks/useBlockchain';

const Dashboard = () => {
  const { connected, publicKey } = useWallet();
  const { balance } = useBlockchain();
  const { transactions } = useTransactionStore();
  const [liveActivity, setLiveActivity] = useState<any[]>([]);

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

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.status === 'confirmed' && (tx.type === 'bet' || tx.type === 'win' || tx.type === 'loss'))
      .slice(0, 5);
  }, [transactions]);

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        { type: 'big_win', user: 'Player***' + Math.floor(Math.random() * 999), amount: Math.random() * 10 + 1, game: 'Coin Flip' },
        { type: 'new_game', user: 'Player***' + Math.floor(Math.random() * 999), game: 'Dice Roll' },
        { type: 'big_win', user: 'Player***' + Math.floor(Math.random() * 999), amount: Math.random() * 15 + 2, game: 'Slots' },
      ];
      
      const newEvent = {
        ...events[Math.floor(Math.random() * events.length)],
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };

      setLiveActivity(prev => [newEvent, ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 p-8"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_40px_var(--accent-glow)]">
            <Wallet className="w-10 h-10 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-[var(--accent)] bg-clip-text text-transparent">
              Connect Your Wallet
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              Connect your Solana wallet to access your dashboard and start playing casino games.
            </p>
          </div>
          <Button size="lg" className="mt-4">
            Get Started
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
              <Wallet className="w-6 h-6 text-[var(--accent)]" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Your Balance</p>
                <p className="text-xl font-bold">{balance?.toFixed(4) || '0.0000'} SOL</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
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
        </motion.div>
      </div>

      {/* Recent Activity & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[var(--accent)]" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest game transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.signature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'win' ? 'bg-green-500/10' : tx.type === 'loss' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                          {tx.type === 'win' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : tx.type === 'loss' ? (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          ) : (
                            <Coins className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.game || 'Game'}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'win' ? 'text-green-400' : tx.type === 'loss' ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                          {tx.type === 'win' ? '+' : tx.type === 'loss' ? '-' : ''}{tx.amount.toFixed(4)} SOL
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">Start playing to see your game history!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
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
                <div className="space-y-3">
                  {liveActivity.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[var(--accent)]/5 to-transparent border border-[var(--border)]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center text-xs font-bold text-black">
                          {event.user.slice(-3)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {event.type === 'big_win' && `🎉 ${event.user} won big!`}
                            {event.type === 'new_game' && `🎮 ${event.user} is playing`}
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
              ) : (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Waiting for live activity...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your favorite games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button size="lg" className="w-full" onClick={() => window.location.href = '/games'}>
                <Gamepad2 className="w-5 h-5 mr-2" />
                Play Games
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => window.location.href = '/create'}>
                <Coins className="w-5 h-5 mr-2" />
                Create Casino
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => window.location.href = '/about'}>
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;