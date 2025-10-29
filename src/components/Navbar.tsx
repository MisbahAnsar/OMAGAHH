import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins, Dices, PlusCircle, LayoutDashboard, Menu, X, Trophy } from 'lucide-react';
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
    { to: '/about', label: 'About', icon: Trophy },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-4">
      <nav className="max-w-7xl mx-auto backdrop-blur-xl bg-[var(--background)]/80 border border-[var(--border)] rounded-2xl shadow-2xl">
        <div className="px-4 lg:px-6">
          <div className="grid grid-cols-3 items-center h-16 gap-4">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center group">
              <span 
                className="bg-gradient-to-r from-white via-[var(--accent)] to-white bg-clip-text text-transparent"
                style={{
                  fontFamily: '"Edu NSW ACT Foundation", cursive',
                  fontSize: '28px',
                  fontWeight: 500,
                  lineHeight: '1.2',
                }}
              >
                OMAGAHH
              </span>
            </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all ${
                    active
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_15px_var(--accent-glow)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-end space-x-2">
            {/* Balance Display */}
            {connected && balance !== null && (
              <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                <Coins className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold">{balance.toFixed(4)} SOL</span>
              </div>
            )}

            {/* Wallet Button */}
            <WalletMultiButton className="!bg-gradient-to-r !from-[var(--accent)] !to-[var(--secondary)] !text-black hover:!shadow-[0_0_20px_var(--accent-glow)] !transition-all !font-semibold !rounded-lg !h-10 !text-sm" />

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
    </div>
  );
};

export default Navbar;