import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const Hero = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleGetStarted = () => {
    if (connected) {
      navigate('/games');
    } else {
      setVisible(true);
    }
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background)]">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[var(--accent)]/5 to-[var(--secondary)]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--accent)]">Powered by Solana Blockchain</span>
          <Zap className="w-4 h-4 text-[var(--accent)] animate-pulse" />
        </motion.div>

        {/* Main Heading - Cursive Style */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-heading mb-4"
          style={{
            fontFamily: '"Edu NSW ACT Foundation", cursive',
            fontSize: 'clamp(40px, 8vw, 70px)',
            fontWeight: 500,
            lineHeight: '1.1',
            color: 'oklch(0.85 0.15 264.665)',
            textShadow: '0 0 40px rgba(138, 180, 248, 0.3)',
          }}
        >
          Experience true fairness
        </motion.h1>

        {/* Subheading - Cursive Style */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hero-subheading mb-6"
          style={{
            fontFamily: '"Edu NSW ACT Foundation", cursive',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 500,
            lineHeight: '1.2',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Win with transparency
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto mb-3 leading-relaxed"
        >
          Stop wondering if the game is fair. Play on Solana's blockchain with
          provably fair games, instant payouts, and complete transparency for
          every bet, spin, and win.
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm text-[var(--accent)] font-medium mb-8 tracking-wide"
        >
          Crafted for modern decentralized gaming
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center items-center"
        >
          {/* Get Started Button */}
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="group relative px-10 py-7 text-xl font-semibold overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] hover:shadow-[0_0_50px_var(--accent-glow)] transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <span>{connected ? 'Start Playing' : 'Get Started'}</span>
              <Zap className="w-6 h-6" />
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent"></div>
    </div>
  );
};

export default Hero;

