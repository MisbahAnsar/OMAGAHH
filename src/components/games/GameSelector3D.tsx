import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Coins, Dice1, Zap, Heart, Target, Crown,
  Play, Trophy, Flame, Sparkles, Gem, Clock, Gamepad2
} from 'lucide-react';
import { useTransactionStore } from '../../hooks/useBlockchain';

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minBet: number;
  maxPayout: string;
  players: number;
  gradient: string;
  bgImage: string;
  features: string[];
  isNew?: boolean;
  isHot?: boolean;
  comingSoon?: boolean;
}

const GAME_CARDS: GameCard[] = [
  {
    id: 'coinflip',
    title: 'Ultra Coin Flip',
    description: 'Classic 50/50 chance with stunning 3D physics and particle effects',
    icon: Coins,
    path: '/coinflip',
    difficulty: 'Easy',
    minBet: 0.01,
    maxPayout: '1.95x',
    players: 1247,
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    bgImage: '/images/coinflip-bg.jpg',
    features: ['Provably Fair', '3D Physics', 'Instant Results'],
    isHot: true,
  },
  {
    id: 'dice',
    title: 'Ultra Dice Roll',
    description: 'Roll the dice with customizable odds and massive multipliers',
    icon: Dice1,
    path: '/dice',
    difficulty: 'Medium',
    minBet: 0.01,
    maxPayout: '9.8x',
    players: 892,
    gradient: 'from-red-500 via-pink-500 to-purple-500',
    bgImage: '/images/dice-bg.jpg',
    features: ['Variable Odds', 'High Multipliers', 'Risk Control'],
  },
  {
    id: 'slots',
    title: 'Ultra Slots',
    description: 'Spin the reels with legendary symbols and progressive jackpots',
    icon: Zap,
    path: '/slots',
    difficulty: 'Easy',
    minBet: 0.01,
    maxPayout: '25x',
    players: 2156,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgImage: '/images/slots-bg.jpg',
    features: ['Progressive Jackpot', 'Bonus Rounds', 'Free Spins'],
    comingSoon: true,
  },
];

const GameSelector3D: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const { connected } = useWallet();
  const { transactions } = useTransactionStore();

  // Calculate real player stats from transactions
  const gameStats = useMemo(() => {
    const stats: Record<string, { players: number; recentPlays: number }> = {
      coinflip: { players: 1247, recentPlays: 0 },
      dice: { players: 892, recentPlays: 0 },
      slots: { players: 2156, recentPlays: 0 },
      blackjack: { players: 634, recentPlays: 0 },
      roulette: { players: 445, recentPlays: 0 },
      poker: { players: 1823, recentPlays: 0 },
    };

    // Count recent plays for each game
    transactions.forEach(tx => {
      if (tx.game && stats[tx.game]) {
        stats[tx.game].recentPlays++;
      }
    });

    return stats;
  }, [transactions]);

  // Simulate live player activity
  const [livePlayerCounts, setLivePlayerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize with base counts
    const initialCounts: Record<string, number> = {};
    GAME_CARDS.forEach(game => {
      initialCounts[game.id] = game.players;
    });
    setLivePlayerCounts(initialCounts);

    // Simulate player count changes
    const interval = setInterval(() => {
      setLivePlayerCounts(prev => {
        const updated = { ...prev };
        GAME_CARDS.forEach(game => {
          if (!game.comingSoon) {
            // Random change between -5 and +10 players
            const change = Math.floor(Math.random() * 16) - 5;
            updated[game.id] = Math.max(50, (updated[game.id] || game.players) + change);
          }
        });
        return updated;
      });
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredGames = GAME_CARDS.filter(game => {
    if (selectedFilter === 'all') return true;
    return game.difficulty.toLowerCase() === selectedFilter;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background)] p-6 pt-24">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--accent-glow)] rounded-full blur-3xl opacity-10 animate-float pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--secondary-glow)] rounded-full blur-3xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[var(--gold-glow)] rounded-full blur-3xl opacity-5 animate-pulse-glow pointer-events-none"></div>
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 
            className="gradient-text mb-6"
            style={{
              fontFamily: '"Edu NSW ACT Foundation", cursive',
              fontSize: 'clamp(40px, 7vw, 70px)',
              fontWeight: 500,
              lineHeight: '1.1',
            }}
          >
            Game Universe
          </h1>

          <p 
            className="text-[var(--text-secondary)] max-w-4xl mx-auto mb-8"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: '1.6',
            }}
          >
            Enter a world of next-generation gaming with stunning 3D graphics,
            provably fair mechanics, and life-changing jackpots
          </p>

          {/* Filter Buttons */}
          <div className="flex items-center justify-center space-x-4">
            {(['all', 'easy', 'medium', 'hard'] as const).map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  selectedFilter === filter
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-white shadow-2xl'
                    : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Game Cards Grid */}
        <motion.div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10"
          layout
        >
          <AnimatePresence>
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -50, rotateX: 15 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                onHoverStart={() => setHoveredCard(game.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative z-10 game-card"
              >
                {/* Card Container */}
                <div className={`relative h-[540px] rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 ${
                  game.comingSoon 
                    ? 'bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-yellow-500/30 group-hover:border-yellow-500/50' 
                    : 'bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--background)] border-[var(--border)] group-hover:border-[var(--accent)]/50'
                }`}>

                  {/* Background Gradient Accent */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${game.comingSoon ? 'from-yellow-500 to-orange-500' : game.gradient} ${game.comingSoon ? 'opacity-3' : 'opacity-5'} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Content */}
                  <div className="relative h-full flex flex-col p-6 pt-8">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        {/* Icon + Title */}
                        <div className="flex items-center space-x-4">
                          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${game.gradient} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                            <game.icon className="w-8 h-8 text-white relative z-10" />
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} blur-md opacity-50 rounded-2xl`} />
                          </div>

                          <div>
                            <h3 
                              className="text-white mb-1"
                              style={{
                                fontFamily: '"Edu NSW ACT Foundation", cursive',
                                fontSize: '24px',
                                fontWeight: 500,
                                lineHeight: '1.2',
                              }}
                            >
                              {game.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(game.difficulty)}`}>
                                {game.difficulty}
                              </div>
                              {/* Player count indicator */}
                              <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs font-semibold text-green-400">
                                  {(livePlayerCounts[game.id] || game.players).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col space-y-2">
                          {game.isNew && (
                            <div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                              NEW
                            </div>
                          )}
                          {game.isHot && (
                            <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-xs font-bold text-white flex items-center shadow-lg backdrop-blur-sm">
                              <Flame className="w-3.5 h-3.5 mr-1" />
                              HOT
                            </div>
                          )}
                          {game.comingSoon && (
                            <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm">
                              SOON
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed line-clamp-2">
                      {game.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <div className="grid grid-cols-3 gap-2">
                        {game.features.slice(0, 3).map((feature, idx) => (
                          <div
                            key={idx}
                            className="relative px-2 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-center hover:border-[var(--accent)]/50 transition-all group/feature"
                          >
                            <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${game.gradient} opacity-0 group-hover/feature:opacity-100 transition-opacity`} />
                            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide group-hover/feature:text-[var(--accent)] transition-colors">
                              {feature}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6">
                      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Min Bet */}
                          <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wide">Min Bet</div>
                            <div className="text-lg font-bold text-white">{game.minBet}</div>
                            <div className="text-xs text-[var(--text-secondary)]">SOL</div>
                          </div>
                          
                          {/* Divider */}
                          <div className="flex items-center justify-center">
                            <div className="h-12 w-px bg-[var(--border)]" />
                          </div>
                          
                          {/* Max Win */}
                          <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wide">Max Win</div>
                            <div className={`text-lg font-bold bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent`}>
                              {game.maxPayout}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">Multiplier</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto">
                      {game.comingSoon ? (
                        <button
                          disabled
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 text-gray-400 font-bold text-base cursor-not-allowed relative overflow-hidden"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <span>Coming Soon</span>
                          </div>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {/* Warning for non-connected */}
                          {!connected && (
                            <div className="flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 text-xs font-semibold">
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                              <span>Connect wallet to play</span>
                            </div>
                          )}
                          
                          {/* Play Button */}
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                              to={game.path}
                              className={`block w-full py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 relative overflow-hidden ${
                                connected 
                                  ? 'bg-[var(--accent)] hover:shadow-[0_0_30px] hover:shadow-[var(--accent-glow)] text-white' 
                                  : 'bg-[var(--card-hover)] hover:bg-[var(--card)] text-[var(--text-primary)] border-2 border-[var(--border)] hover:border-[var(--accent)]'
                              }`}
                            >
                              <div className="flex items-center justify-center space-x-2 relative z-10">
                                <Play className="w-5 h-5" />
                                <span className="tracking-wide">{connected ? 'PLAY NOW' : 'Connect & Play'}</span>
                                {connected && <Zap className="w-5 h-5" />}
                              </div>
                              
                              {/* Shimmer effect */}
                              {connected && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                              )}
                            </Link>
                          </motion.div>
                          
                          {/* Personal Stats */}
                          {gameStats[game.id]?.recentPlays > 0 && connected && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-center space-x-2 text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 py-2 rounded-lg border border-[var(--accent)]/30"
                            >
                              <Gamepad2 className="w-4 h-4" />
                              <span>Played {gameStats[game.id].recentPlays}x</span>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Border Glow */}
                  {hoveredCard === game.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute -inset-[1px] bg-gradient-to-br ${game.gradient} rounded-2xl blur-sm opacity-50 -z-10`}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default GameSelector3D;
