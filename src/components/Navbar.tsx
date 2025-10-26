import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins, Dices, PlusCircle, Settings, LayoutDashboard, Menu, X, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { useBlockchain } from '../hooks/useBlockchain';

const Navbar = () => {
  const { connected } = useWallet();
  const { balance } = useBlockchain();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/games', label: 'Games', icon: Dices },
    { to: '/create', label: 'Create Casino', icon: PlusCircle },
    { to: '/about', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)] shadow-lg">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Coins className="w-8 h-8 text-[var(--accent)] group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[var(--accent)] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-[var(--accent)] to-white bg-clip-text text-transparent">
                SolanaCasino
              </span>
              <span className="text-xs text-[var(--text-secondary)] -mt-1">Play & Win SOL</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    active
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_15px_var(--accent-glow)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Balance Display */}
            {connected && balance !== null && (
              <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                <Coins className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold">{balance.toFixed(4)} SOL</span>
              </div>
            )}

            {/* Settings Button */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Settings className="w-5 h-5" />
            </Button>

            {/* Wallet Button */}
            <WalletMultiButton className="!bg-gradient-to-r !from-[var(--accent)] !to-[var(--secondary)] !text-black hover:!shadow-[0_0_20px_var(--accent-glow)] !transition-all !font-semibold !rounded-lg !h-10" />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-[var(--border)] animate-slide-up">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
            {connected && balance !== null && (
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg mt-4">
                <span className="text-sm text-[var(--text-secondary)]">Balance</span>
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm font-semibold">{balance.toFixed(4)} SOL</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;