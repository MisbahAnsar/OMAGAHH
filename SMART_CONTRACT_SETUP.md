# 🚀 Smart Contract Setup & Deployment Guide

## ✅ What You Need

### 1. **Install Rust & Solana CLI**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Verify installations
rustc --version
solana --version
```

### 2. **Install Anchor Framework**
```bash
# Install Anchor (Solana smart contract framework)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify
anchor --version
```

### 3. **Install Node Dependencies**
```bash
# Install Anchor project-serum packages
npm install @project-serum/anchor @solana/web3.js
```

---

## 📝 Step-by-Step Deployment

### Step 1: Create Solana Wallet for Devnet

```bash
# Create a new wallet (if you don't have one)
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set it as default
solana config set --keypair ~/.config/solana/devnet.json

# Set to devnet
solana config set --url https://api.devnet.solana.com

# Verify
solana config get
```

**Output should show:**
```
Config File: ~/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: ~/.config/solana/devnet.json
```

### Step 2: Get Devnet SOL (Free Test SOL)

```bash
# Airdrop 2 SOL (can do multiple times)
solana airdrop 2

# Check balance
solana balance

# If airdrop fails, use the web faucet:
# Visit: https://faucet.solana.com
```

**You need at least 5 SOL on devnet** to:
- Deploy the program (~2 SOL)
- Initialize the casino (~0.5 SOL)
- Fund the vault (~2 SOL)
- Have some for testing

### Step 3: Update Program ID

```bash
# Build the program first to get the program ID
cd programs/casino
anchor build

# Get the program ID
solana address -k target/deploy/casino-keypair.json
```

**Copy the output address** (it will look like: `7xQ2DtQ...`)

Update in these files:

**1. `programs/casino/src/lib.rs` (or `lib_simple.rs`)**
```rust
// Change this line:
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**2. `src/lib/casino-program.ts`**
```typescript
// Change this line:
export const CASINO_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

**3. `Anchor.toml` (if it exists)**
```toml
[programs.devnet]
casino = "YOUR_PROGRAM_ID_HERE"
```

### Step 4: Build & Deploy the Program

```bash
# From project root or programs/casino directory
anchor build

# Deploy to devnet
anchor deploy

# If deploy fails due to insufficient funds, fund the program:
solana program deploy target/deploy/casino.so
```

**Successful deployment will show:**
```
Program Id: YOUR_PROGRAM_ID

Deploy success! 
```

### Step 5: Initialize the Casino

You need to run this ONCE to set up the casino:

```bash
# Create a script to initialize
# Save this as scripts/init-casino.ts
```

Or use the frontend:

**Create: `src/scripts/init-casino.ts`**
```typescript
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@project-serum/anchor';
import { initializeCasino } from '../lib/casino-program';

async function main() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  // Use your wallet here
  const wallet = ...; // Your wallet adapter
  
  const signature = await initializeCasino(connection, wallet);
  console.log('Casino initialized!', signature);
}

main();
```

OR initialize via frontend:
- Connect your wallet
- Open browser console (F12)
- Run:
```javascript
// This will be in your app already
// Just add a button in the UI to call it
```

### Step 6: Fund the Casino Vault

The vault needs funds to pay out winners:

```bash
# Transfer SOL to the vault
# The vault address is a PDA derived from seeds

# You can fund it through the smart contract:
# Call the fundVault instruction with your admin wallet
```

Or use this script:

**Create: `src/scripts/fund-vault.ts`**
```typescript
import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getVaultPDA, CasinoProgram } from '../lib/casino-program';

async function fundVault() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const wallet = ...; // Your wallet
  
  const casinoProgram = new CasinoProgram(connection, wallet);
  
  // Fund with 2 SOL
  const amount = 2 * LAMPORTS_PER_SOL;
  
  // Call fundVault instruction
  // ... implementation
  
  console.log('Vault funded with 2 SOL!');
}

fundVault();
```

---

## 🔧 Configuration

### Update Frontend Configuration

**File: `src/App.tsx` or create `src/config.ts`**

```typescript
export const NETWORK = 'devnet'; // or 'mainnet-beta' for production

export const RPC_ENDPOINT = 
  NETWORK === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
```

**Update WalletProvider:**

Make sure your wallet provider uses devnet:

```typescript
const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
```

---

## ✅ Testing the Setup

### Test 1: Check Casino State

```typescript
// In browser console or your app
const casino = await casinoProgram.getCasinoState();
console.log('Casino State:', {
  totalWagered: casino.totalWagered,
  totalPayout: casino.totalPayout,
  minBet: casino.minBet,
  maxBet: casino.maxBet,
});
```

### Test 2: Place a Small Bet

```typescript
// Connect wallet first
// Then in your game component:

const handleTestBet = async () => {
  try {
    const result = await placeBet(0.01, 'coinflip', { choice: 'heads' });
    console.log('Bet result:', result);
  } catch (error) {
    console.error('Bet failed:', error);
  }
};
```

### Test 3: Check Vault Balance

```bash
# Get vault address
solana address -k <vault-pubkey>

# Check balance
solana balance <vault-address>

# Should show the amount you funded
```

---

## 🎮 How to Use in Your App

### 1. Connect Wallet (Already done)
Your navbar already has wallet connection!

### 2. Play a Game

**Example: Coin Flip**

```typescript
// In UltraCoinFlip component
const handleFlip = async () => {
  try {
    setState({ isFlipping: true });
    
    // REAL BET - THIS WILL USE ACTUAL SOL!
    const result = await placeBet(
      parseFloat(state.betAmount), // e.g., 0.1 SOL
      'coinflip',
      { choice: state.prediction } // 'heads' or 'tails'
    );
    
    if (result.won) {
      // Player won! SOL already sent back by contract
      toast.success('You won! 🎉');
    } else {
      // Player lost - SOL kept by casino
      toast.error('You lost!');
    }
    
    // Balance automatically updated
    
  } catch (error) {
    console.error('Game failed:', error);
  } finally {
    setState({ isFlipping: false });
  }
};
```

### 3. Check Balance After Game

```typescript
// Balance updates automatically after each game
// Check in dashboard or navbar
console.log('Current balance:', balance);
```

---

## 🔒 Security Notes

### For Devnet Testing:
- ✅ Use devnet SOL (free)
- ✅ Test all games thoroughly
- ✅ Check vault has enough funds
- ✅ Verify wins/losses work correctly

### Before Mainnet:
- ⚠️ **AUDIT THE CODE**
- ⚠️ Use proper VRF (Verifiable Random Function)
- ⚠️ Set appropriate bet limits
- ⚠️ Implement emergency pause
- ⚠️ Test extensively on devnet first!

---

## 📊 Monitoring

### View Transactions

```bash
# View recent transactions
solana confirm -v <signature>

# View program logs
solana logs <program-id>
```

### In Solana Explorer

Visit: https://explorer.solana.com/?cluster=devnet

Search for:
- Your wallet address
- Program ID
- Transaction signatures

---

## ❓ Troubleshooting

### Problem: "Insufficient funds"
**Solution:** Airdrop more devnet SOL
```bash
solana airdrop 2
```

### Problem: "Program deploy failed"
**Solution:** Your wallet needs more SOL for deployment
```bash
solana airdrop 2
solana airdrop 2
# Repeat until you have 5+ SOL
```

### Problem: "Account not found"
**Solution:** Casino not initialized yet
- Run the initialize function first
- Make sure you're using the correct program ID

### Problem: "Transaction failed"
**Solution:** Check:
- Wallet has enough SOL for bet + transaction fee
- Vault has enough SOL to pay winners
- You're on the correct network (devnet)

### Problem: "Invalid account data"
**Solution:** 
- Rebuild the program: `anchor build`
- Redeploy: `anchor deploy`
- Re-initialize casino

---

## 🚀 Quick Start Commands

```bash
# 1. Setup Solana
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/devnet.json
solana config set --keypair ~/.config/solana/devnet.json

# 2. Get SOL
solana airdrop 2
solana airdrop 2
solana airdrop 2

# 3. Build & Deploy
cd programs/casino
anchor build
anchor deploy

# 4. Update Program ID in code (see step 3 above)

# 5. Initialize Casino (via frontend or script)

# 6. Fund Vault (via frontend or script)

# 7. Start testing!
npm run dev
```

---

## 📝 Checklist

Before you can start playing with real bets:

- [ ] Rust & Solana CLI installed
- [ ] Anchor framework installed
- [ ] Wallet created and configured for devnet
- [ ] At least 5 SOL on devnet
- [ ] Program built successfully
- [ ] Program deployed to devnet
- [ ] Program ID updated in all files
- [ ] Casino initialized
- [ ] Vault funded with at least 2 SOL
- [ ] Frontend can connect to wallet
- [ ] Test bet works (try 0.01 SOL)

---

## 🎯 Next Steps

1. **Deploy the program** (follow steps above)
2. **Test with small bets** (0.01 SOL)
3. **Verify wins and losses** work correctly
4. **Check balance changes** after each game
5. **Monitor transactions** in Solana Explorer

---

## 💡 Need Help?

If you get stuck:

1. **Check Solana Explorer** for transaction details
2. **View program logs:** `solana logs <program-id>`
3. **Verify balances:** `solana balance`
4. **Check configuration:** `solana config get`

**Common Issues:**
- Not enough SOL → Airdrop more
- Wrong network → Switch to devnet
- Program not found → Check program ID
- Transaction failed → Check vault balance

---

**You're ready to deploy! Follow the steps above and your casino will use REAL SOL! 🎰💰**

Remember: Start with devnet (free SOL) and test thoroughly before even considering mainnet!

