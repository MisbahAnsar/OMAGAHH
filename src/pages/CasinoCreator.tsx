import React from 'react';
import { Sparkles, Rocket, Clock } from 'lucide-react';

const CasinoCreator = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 
              className="bg-gradient-to-r from-white via-[var(--accent)] to-white bg-clip-text text-transparent"
              style={{
                fontFamily: '"Edu NSW ACT Foundation", cursive',
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 500,
                lineHeight: '1.2',
              }}
            >
              Coming Soon
            </h1>
            
            <h2 
              className="text-[var(--text-primary)]"
              style={{
                fontFamily: '"Edu NSW ACT Foundation", cursive',
                fontSize: 'clamp(24px, 4vw, 42px)',
                fontWeight: 500,
                lineHeight: '1.3',
              }}
            >
              Create Your Own Casino
            </h2>
          </div>

          {/* Description */}
          <p 
            className="text-[var(--text-secondary)] max-w-2xl mx-auto"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: '1.8',
            }}
          >
            We're working hard to bring you an incredible casino creation platform. 
            Soon you'll be able to launch your own provably fair casino with custom tokens, 
            game configurations, and Telegram bot integration.
          </p>

          {/* Status Badge */}
          <div className="flex justify-center items-center space-x-3 pt-8">
            <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-pulse" />
            <span 
              className="text-[var(--accent)]"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              In Development
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoCreator;