/**
 * Casino Initialization Script
 * Run this ONCE after deploying the program
 */

const anchor = require('@project-serum/anchor');
const { Connection, clusterApiUrl, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function initializeCasino() {
  console.log('🎰 Initializing Casino on Devnet...\n');

  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  console.log('✅ Connected to devnet');

  // Load wallet
  const walletPath = path.join(process.env.HOME, '.config/solana/id.json');
  
  if (!fs.existsSync(walletPath)) {
    console.error('❌ Wallet not found at:', walletPath);
    console.log('\n💡 Create a wallet first:');
    console.log('   solana-keygen new');
    process.exit(1);
  }

  const keypairData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log('✅ Loaded wallet:', keypair.publicKey.toString());

  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('💰 Balance:', balance / anchor.web3.LAMPORTS_PER_SOL, 'SOL');

  if (balance < 1000000000) { // Less than 1 SOL
    console.error('\n❌ Insufficient balance! Need at least 1 SOL');
    console.log('💡 Get devnet SOL:');
    console.log('   solana airdrop 2');
    process.exit(1);
  }

  // Load program
  const programId = new anchor.web3.PublicKey('CasinoProgram11111111111111111111111111111');
  console.log('📝 Program ID:', programId.toString());

  // Create provider
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  // Load IDL
  const idlPath = path.join(__dirname, '../target/idl/casino.json');
  
  if (!fs.existsSync(idlPath)) {
    console.error('❌ IDL not found!');
    console.log('💡 Build the program first:');
    console.log('   anchor build');
    process.exit(1);
  }

  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const program = new anchor.Program(idl, programId, provider);

  // Get PDAs
  const [casino] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('casino')],
    programId
  );

  const [vault] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('vault')],
    programId
  );

  console.log('🏦 Casino PDA:', casino.toString());
  console.log('🏦 Vault PDA:', vault.toString());

  try {
    // Check if already initialized
    const casinoAccount = await program.account.casino.fetch(casino);
    console.log('\n⚠️  Casino already initialized!');
    console.log('Total Wagered:', casinoAccount.totalWagered.toNumber() / anchor.web3.LAMPORTS_PER_SOL, 'SOL');
    console.log('Total Payout:', casinoAccount.totalPayout.toNumber() / anchor.web3.LAMPORTS_PER_SOL, 'SOL');
    return;
  } catch (error) {
    // Not initialized yet - this is expected
    console.log('\n🚀 Initializing casino...');
  }

  try {
    // Initialize casino
    const tx = await program.methods
      .initialize()
      .accounts({
        casino,
        vault,
        authority: keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Casino initialized!');
    console.log('📝 Transaction:', tx);
    console.log('\n🎉 Success! Casino is ready to accept bets!');
    console.log('\n💡 Next steps:');
    console.log('   1. Fund the vault with: npm run fund-vault');
    console.log('   2. Start the app: npm run dev');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    
    if (error.message.includes('Account already in use')) {
      console.log('\n💡 Casino may already be initialized');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Make sure program is deployed: anchor deploy');
      console.log('   - Check you have enough SOL: solana balance');
      console.log('   - Verify network: solana config get');
    }
  }
}

initializeCasino().catch(console.error);

