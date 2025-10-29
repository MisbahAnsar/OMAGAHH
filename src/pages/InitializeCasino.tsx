import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Rocket, AlertCircle, CheckCircle, Loader, Coins, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CasinoAdmin } from '../utils/admin';
import { getCasinoPDA, getVaultPDA } from '../lib/casino-program';

const InitializeCasino: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fundAmount, setFundAmount] = useState('10');
  const [initTxSignature, setInitTxSignature] = useState('');
  const [fundTxSignature, setFundTxSignature] = useState('');

  const handleInitialize = async () => {
    if (!wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!wallet.signTransaction) {
      toast.error('Wallet does not support transaction signing');
      return;
    }

    setIsInitializing(true);
    try {
      toast.loading('Creating admin instance...', { id: 'init' });
      
      const admin = new CasinoAdmin(connection, wallet);
      
      toast.loading('Initializing casino on-chain...', { id: 'init' });
      const txSig = await admin.initialize();
      
      setInitTxSignature(txSig);
      setIsInitialized(true);
      
      toast.success('Casino initialized successfully!', { id: 'init' });
    } catch (error: any) {
      console.error('Initialization error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        logs: error.logs
      });
      
      if (error.message.includes('already in use')) {
        toast.error('Casino is already initialized!', { id: 'init' });
        setIsInitialized(true);
      } else if (error.message.includes('Wallet not connected')) {
        toast.error('Please connect your wallet first', { id: 'init' });
      } else if (error.message.includes('User rejected')) {
        toast.error('Transaction cancelled by user', { id: 'init' });
      } else {
        toast.error(`Failed: ${error.message || 'Unknown error'}`, { id: 'init' });
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const handleFundVault = async () => {
    if (!wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!wallet.signTransaction) {
      toast.error('Wallet does not support transaction signing');
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsFunding(true);
    try {
      toast.loading('Creating admin instance...', { id: 'fund' });
      
      const admin = new CasinoAdmin(connection, wallet);
      
      toast.loading(`Sending ${amount} SOL to vault...`, { id: 'fund' });
      const txSig = await admin.fundVault(amount);
      
      setFundTxSignature(txSig);
      
      toast.success(`Vault funded with ${amount} SOL!`, { id: 'fund' });
    } catch (error: any) {
      console.error('Funding error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        logs: error.logs
      });
      
      if (error.message.includes('Wallet not connected')) {
        toast.error('Please connect your wallet first', { id: 'fund' });
      } else if (error.message.includes('User rejected')) {
        toast.error('Transaction cancelled by user', { id: 'fund' });
      } else if (error.message.includes('Insufficient')) {
        toast.error('Insufficient balance in wallet', { id: 'fund' });
      } else {
        toast.error(`Failed: ${error.message || 'Unknown error'}`, { id: 'fund' });
      }
    } finally {
      setIsFunding(false);
    }
  };

  const casinoPDA = getCasinoPDA().toString();
  const vaultPDA = getVaultPDA().toString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-16 h-16 text-[var(--accent)] mr-4" />
            <h1 className="text-5xl font-black gradient-text">
              Initialize Casino
            </h1>
          </div>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            One-time setup to initialize the casino smart contract and fund the vault
          </p>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-6 mb-8 border-2 border-yellow-500/30"
        >
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2 text-yellow-500">Admin Only</h3>
              <p className="text-[var(--text-secondary)]">
                This page is only for the casino administrator. You must connect with the 
                authority wallet to initialize the casino and fund the vault.
              </p>
              <p className="text-[var(--text-secondary)] mt-2">
                <strong>Authority Wallet:</strong> A24myXDMBj4FPMWuzBYsEyhxMtZgfoUmHiEF3pFBfecK
              </p>
            </div>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold mb-4">Connection Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Wallet Connected</span>
              {wallet.connected ? (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center text-red-500">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Not Connected
                </span>
              )}
            </div>
            {wallet.publicKey && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Your Address</span>
                <span className="font-mono text-sm">
                  {wallet.publicKey.toString().slice(0, 8)}...{wallet.publicKey.toString().slice(-8)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Network</span>
              <span className="text-[var(--accent)]">Devnet</span>
            </div>
          </div>
        </motion.div>

        {/* PDAs Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold mb-4">Program Addresses</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Casino PDA</label>
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg font-mono text-sm break-all">
                {casinoPDA}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Vault PDA</label>
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg font-mono text-sm break-all">
                {vaultPDA}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step 1: Initialize */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl font-bold mr-4">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold">Initialize Casino</h3>
              <p className="text-[var(--text-secondary)]">Create the casino account on-chain</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInitialize}
            disabled={!wallet.connected || isInitializing || isInitialized}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] hover:from-[var(--accent-hover)] hover:to-[var(--secondary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all duration-300 shadow-lg"
          >
            {isInitializing ? (
              <span className="flex items-center justify-center">
                <Loader className="w-6 h-6 mr-2 animate-spin" />
                Initializing...
              </span>
            ) : isInitialized ? (
              <span className="flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Initialized
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Rocket className="w-6 h-6 mr-2" />
                Initialize Casino
              </span>
            )}
          </motion.button>

          {initTxSignature && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-500 mb-2">✅ Transaction Successful!</p>
              <a
                href={`https://explorer.solana.com/tx/${initTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-[var(--accent)] hover:underline break-all"
              >
                View on Explorer →
              </a>
            </div>
          )}
        </motion.div>

        {/* Step 2: Fund Vault */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl font-bold mr-4">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold">Fund Vault</h3>
              <p className="text-[var(--text-secondary)]">Add SOL to the vault for payouts</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">Amount (SOL)</label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full px-6 py-4 text-2xl font-bold bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl focus:border-[var(--accent)] focus:outline-none transition-all duration-300 text-center"
              min="0.01"
              step="0.1"
              disabled={!isInitialized || isFunding}
            />
            <div className="flex justify-between mt-3 space-x-2">
              {[1, 5, 10, 50].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setFundAmount(amount.toString())}
                  className="flex-1 py-2 px-3 rounded-lg bg-[var(--card-hover)] hover:bg-[var(--accent)] transition-all duration-300 font-bold text-sm"
                  disabled={!isInitialized || isFunding}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFundVault}
            disabled={!wallet.connected || !isInitialized || isFunding}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-all duration-300 shadow-lg"
          >
            {isFunding ? (
              <span className="flex items-center justify-center">
                <Loader className="w-6 h-6 mr-2 animate-spin" />
                Funding Vault...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Coins className="w-6 h-6 mr-2" />
                Fund Vault
              </span>
            )}
          </motion.button>

          {fundTxSignature && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-500 mb-2">✅ Vault Funded Successfully!</p>
              <a
                href={`https://explorer.solana.com/tx/${fundTxSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-[var(--accent)] hover:underline break-all"
              >
                View on Explorer →
              </a>
            </div>
          )}
        </motion.div>

        {/* Success Message */}
        {isInitialized && fundTxSignature && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 glass-effect rounded-2xl p-8 text-center border-2 border-green-500/30"
          >
            <Shield className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-green-500">Casino Ready!</h2>
            <p className="text-xl text-[var(--text-secondary)] mb-6">
              Your casino is now initialized and funded. Players can start playing!
            </p>
            <a
              href="/coinflip"
              className="inline-block py-3 px-8 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-white font-bold text-lg hover:scale-105 transition-all duration-300"
            >
              Go to Games →
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InitializeCasino;

