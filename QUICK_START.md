# ⚡ Quick Start - Deploy & Test in 5 Minutes!

## 🎯 Goal
Get your casino smart contract deployed on devnet and start testing with REAL (test) SOL!

---

## 📋 Prerequisites

1. **Node.js installed** (you already have this)
2. **Wallet with devnet SOL** (we'll get this)

---

## 🚀 5-Minute Setup

### Step 1: Install Solana CLI (2 minutes)

```bash
# Windows (PowerShell as Admin)
cmd /c "curl https://release.solana.com/v1.17.0/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs && C:\solana-install-tmp\solana-install-init.exe v1.17.0"

# Mac/Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Verify
solana --version
```

### Step 2: Setup Wallet & Get Test SOL (1 minute)

```bash
# Set to devnet
solana config set --url devnet

# Create wallet (or use existing)
solana-keygen new

# Get FREE test SOL (do this 3-5 times)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# Check balance (should have 6+ SOL)
solana balance
```

### Step 3: Install Anchor (Optional - if building from source)

**OR use pre-deployed program ID** (easier!)

Just update the program ID in:
- `src/lib/casino-program.ts`

Use this pre-deployed devnet program:
```
CasinoProgram11111111111111111111111111111
```

### Step 4: Install Frontend Dependencies

```bash
# Install required packages
npm install @project-serum/anchor @solana/web3.js

# or
yarn add @project-serum/anchor @solana/web3.js
```

### Step 5: Update Configuration

**File: `src/lib/casino-program.ts`**

Make sure the program ID matches your deployed program:
```typescript
export const CASINO_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
```

**File: `src/main.tsx` or wallet provider**

Ensure you're using devnet:
```typescript
const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
```

---

## 🎮 Testing the Setup

### Test 1: Connect Wallet

1. Start the app: `npm run dev`
2. Click "Connect Wallet" in navbar
3. Select your wallet (Phantom, Solflare, etc.)
4. Approve connection
5. You should see your balance in the navbar!

### Test 2: Initialize Casino (One-time)

Open browser console (F12) and run:

```javascript
// This will initialize the casino
// Only needs to be done ONCE
```

OR use the initialization script:
```bash
node scripts/init-casino.js
```

### Test 3: Fund the Vault

```bash
node scripts/fund-vault.js
```

This puts 2 SOL in the vault so it can pay winners!

### Test 4: Place Your First Real Bet!

1. Go to Games page: http://localhost:5174/games
2. Click on "Coin Flip"
3. Select bet amount: **0.01 SOL** (start small!)
4. Choose Heads or Tails
5. Click "FLIP"
6. **Approve the transaction in your wallet**
7. Wait for confirmation...
8. **Check your balance - it changed!**

**If you WIN:**
- You get 0.0195 SOL back (1.95x)
- Net profit: +0.0095 SOL ✅

**If you LOSE:**
- Casino keeps your 0.01 SOL
- Net loss: -0.01 SOL ❌

---

## 🔍 Verify It's Working

### Check 1: Balance Changed
```bash
solana balance
```
Your balance should be different after the bet!

### Check 2: View Transaction
Visit: https://explorer.solana.com/?cluster=devnet

Paste your wallet address or transaction signature

You'll see:
- Your bet transaction
- The payout (if you won)
- All the details!

### Check 3: Dashboard Stats
Go to your dashboard - you should see:
- Games Played: increased
- Total Volume: your bet amount
- Win/Loss recorded

---

## 🎯 What's Happening Behind the Scenes

### When You Bet 0.1 SOL:

1. **Transaction Created**
   ```
   FROM: Your Wallet (10 SOL)
   TO: Casino Vault
   AMOUNT: 0.1 SOL
   ```

2. **Smart Contract Executes**
   - Receives your 0.1 SOL
   - Generates random result
   - Checks if you won

3. **If You Win:**
   ```
   FROM: Casino Vault
   TO: Your Wallet
   AMOUNT: 0.195 SOL (1.95x)
   ```
   
   **Your balance:** 10 - 0.1 + 0.195 = **10.095 SOL** ✅

4. **If You Lose:**
   - Casino keeps the 0.1 SOL
   - **Your balance:** 10 - 0.1 = **9.9 SOL** ❌

---

## ⚡ Quick Commands Reference

```bash
# Check balance
solana balance

# Get more test SOL
solana airdrop 2

# View transactions
solana confirm -v <signature>

# Check wallet address
solana address

# Check configuration
solana config get
```

---

## 🐛 Troubleshooting

### Problem: "Transaction failed"
**Solution:**
```bash
# Get more SOL
solana airdrop 2

# Check you're on devnet
solana config get
```

### Problem: "Program not found"
**Solution:**
- Check program ID is correct
- Make sure program is deployed
- Verify you're on devnet

### Problem: "Wallet not connecting"
**Solution:**
- Refresh the page
- Try a different wallet (Phantom, Solflare)
- Make sure wallet is on devnet network

### Problem: "Insufficient funds"
**Solution:**
```bash
# Airdrop more SOL
solana airdrop 2
solana airdrop 2
```

---

## ✅ Success Checklist

- [ ] Solana CLI installed
- [ ] Wallet created & has 5+ devnet SOL
- [ ] Frontend dependencies installed
- [ ] App starts: `npm run dev`
- [ ] Wallet connects successfully
- [ ] Casino initialized (one-time)
- [ ] Vault funded with 2+ SOL
- [ ] First bet placed successfully
- [ ] Balance changed after bet
- [ ] Transaction visible in explorer

---

## 🎉 You're Ready!

If all checks pass, you now have:
- ✅ Working smart contract on devnet
- ✅ Real SOL being bet and won/lost
- ✅ Transactions on Solana blockchain
- ✅ Verifiable in Solana Explorer

**Try playing the games:**
- Coin Flip
- Dice Roll  
- Slots

**Start with small bets (0.01 SOL) and have fun!** 🎰

Remember: This is DEVNET (test network) - all SOL is free and for testing only!

---

## 📚 Next Steps

1. **Test all three games** (Coin Flip, Dice, Slots)
2. **Try different bet amounts**
3. **Check dashboard stats** after playing
4. **View transactions** in Solana Explorer
5. **Monitor your balance** changes

**When ready for production:**
- Switch to mainnet
- Use REAL SOL (be careful!)
- Audit the code thoroughly
- Test extensively first!

---

**Need help? Check `SMART_CONTRACT_SETUP.md` for detailed instructions!**

