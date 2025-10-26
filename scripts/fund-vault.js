/**
 * Fund Casino Vault Script
 * Run this to add funds to the vault so it can pay winners
 */

const anchor = require('@project-serum/anchor');
const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function fundVault() {
  console.log('💰 Funding Casino Vault...\n');

  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  console.log('✅ Connected to devnet');

  // Load wallet
  const walletPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log('✅ Loaded wallet:', keypair.publicKey.toString());

  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('💰 Your balance:', balance / LAMPORTS_PER_SOL, 'SOL');

  // Amount to fund (2 SOL)
  const fundAmount = 2 * LAMPORTS_PER_SOL;

  if (balance < fundAmount) {
    console.error('\n❌ Insufficient balance to fund vault!');
    console.log('💡 Get more devnet SOL:');
    console.log('   solana airdrop 2');
    process.exit(1);
  }

  // Load program
  const programId = new anchor.web3.PublicKey('CasinoProgram11111111111111111111111111111');
  
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const idlPath = path.join(__dirname, '../target/idl/casino.json');
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

  console.log('🏦 Vault address:', vault.toString());

  // Check current vault balance
  const vaultBalance = await connection.getBalance(vault);
  console.log('📊 Current vault balance:', vaultBalance / LAMPORTS_PER_SOL, 'SOL');

  console.log(`\n💸 Funding vault with ${fundAmount / LAMPORTS_PER_SOL} SOL...`);

  try {
    const tx = await program.methods
      .fundVault(new anchor.BN(fundAmount))
      .accounts({
        casino,
        vault,
        authority: keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log('✅ Vault funded!');
    console.log('📝 Transaction:', tx);

    // Check new balance
    const newVaultBalance = await connection.getBalance(vault);
    console.log('📊 New vault balance:', newVaultBalance / LAMPORTS_PER_SOL, 'SOL');

    console.log('\n🎉 Success! Vault is ready to pay winners!');

  } catch (error) {
    console.error('\n❌ Funding failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Make sure casino is initialized first');
    console.log('   - Check you have enough SOL: solana balance');
    console.log('   - Verify you are the casino authority');
  }
}

fundVault().catch(console.error);

