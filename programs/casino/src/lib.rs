use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer as SystemTransfer};

declare_id!("8zD2fbTQHQRkdQrNs1f7Sd1ApZaUqN5c9GGZ6tSSy62M");

#[program]
pub mod casino {
    use super::*;

    /// Initialize the casino vault
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let casino = &mut ctx.accounts.casino;
        casino.authority = ctx.accounts.authority.key();
        casino.vault_bump = ctx.bumps.vault;
        casino.total_wagered = 0;
        casino.total_payout = 0;
        casino.house_edge = 250; // 2.5% (in basis points)
        casino.min_bet = 10_000_000; // 0.01 SOL
        casino.max_bet = 10_000_000_000; // 10 SOL
        Ok(())
    }

    /// Place a bet (Coin Flip)
    pub fn play_coin_flip(
        ctx: Context<PlayGame>,
        bet_amount: u64,
        prediction: u8, // 0 = heads, 1 = tails
    ) -> Result<()> {
        let casino = &ctx.accounts.casino;
        
        // Validate bet amount
        require!(
            bet_amount >= casino.min_bet,
            ErrorCode::BetTooLow
        );
        require!(
            bet_amount <= casino.max_bet,
            ErrorCode::BetTooHigh
        );
        require!(
            prediction <= 1,
            ErrorCode::InvalidPrediction
        );

        // Transfer bet amount from player to vault
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.player.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            bet_amount,
        )?;

        // Generate random result using recent slot hash
        let clock = Clock::get()?;
        let recent_blockhash = clock.slot;
        let player_key = ctx.accounts.player.key();
        
        // Simple but verifiable randomness for devnet
        let result = ((recent_blockhash ^ player_key.to_bytes()[0] as u64) % 2) as u8;

        let won = result == prediction;
        let payout: u64;

        if won {
            // Calculate payout (1.95x for coin flip)
            payout = (bet_amount * 195) / 100;
            
            // Transfer payout from vault to player
            let bump = [ctx.accounts.casino.vault_bump];
            let seeds = &[
                b"vault".as_ref(),
                bump.as_ref(),
            ];
            let signer = &[&seeds[..]];
            
            transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    SystemTransfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.player.to_account_info(),
                    },
                    signer,
                ),
                payout,
            )?;
        } else {
            payout = 0;
        }

        // Update casino stats
        let casino = &mut ctx.accounts.casino;
        casino.total_wagered += bet_amount;
        if won {
            casino.total_payout += payout;
        }

        // Emit event
        emit!(GamePlayed {
            player: ctx.accounts.player.key(),
            game_type: 0, // 0 = coin flip
            bet_amount,
            prediction,
            result,
            won,
            payout,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Play Dice Roll
    pub fn play_dice_roll(
        ctx: Context<PlayGame>,
        bet_amount: u64,
        prediction: u8, // Target number (1-6)
        is_over: bool,   // Bet over or under
    ) -> Result<()> {
        let casino = &ctx.accounts.casino;
        
        require!(
            bet_amount >= casino.min_bet && bet_amount <= casino.max_bet,
            ErrorCode::InvalidBetAmount
        );
        require!(
            prediction >= 1 && prediction <= 6,
            ErrorCode::InvalidPrediction
        );

        // Transfer bet
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.player.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            bet_amount,
        )?;

        // Generate dice result (1-6)
        let clock = Clock::get()?;
        let result = ((clock.slot ^ ctx.accounts.player.key().to_bytes()[0] as u64) % 6 + 1) as u8;
        
        // Log the result so frontend can parse it
        msg!("Dice Roll Result: {}", result);

        let won = if is_over {
            result > prediction
        } else {
            result < prediction
        };

        let payout: u64;
        if won {
            // Variable multiplier based on probability
            let win_chance = if is_over { 6 - prediction } else { prediction - 1 };
            let multiplier = (600 / win_chance as u64 * 95) / 100; // With 5% house edge
            payout = (bet_amount * multiplier) / 100;
            
            let bump = [ctx.accounts.casino.vault_bump];
            let seeds = &[b"vault".as_ref(), bump.as_ref()];
            transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    SystemTransfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.player.to_account_info(),
                    },
                    &[&seeds[..]],
                ),
                payout,
            )?;
        } else {
            payout = 0;
        }

        let casino = &mut ctx.accounts.casino;
        casino.total_wagered += bet_amount;
        if won {
            casino.total_payout += payout;
        }

        emit!(GamePlayed {
            player: ctx.accounts.player.key(),
            game_type: 1, // 1 = dice
            bet_amount,
            prediction,
            result,
            won,
            payout,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Play Slots
    pub fn play_slots(
        ctx: Context<PlayGame>,
        bet_amount: u64,
    ) -> Result<()> {
        let casino = &ctx.accounts.casino;
        
        require!(
            bet_amount >= casino.min_bet && bet_amount <= casino.max_bet,
            ErrorCode::InvalidBetAmount
        );

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.player.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            bet_amount,
        )?;

        // Generate 3 slot results (0-9)
        let clock = Clock::get()?;
        let slot = clock.slot;
        let player_bytes = ctx.accounts.player.key().to_bytes();
        
        let reel1 = ((slot ^ player_bytes[0] as u64) % 10) as u8;
        let reel2 = ((slot ^ player_bytes[1] as u64) % 10) as u8;
        let reel3 = ((slot ^ player_bytes[2] as u64) % 10) as u8;

        // Check wins
        let multiplier = if reel1 == reel2 && reel2 == reel3 {
            // Three of a kind
            if reel1 == 7 {
                25 // Jackpot! 25x
            } else {
                10 // 10x
            }
        } else if reel1 == reel2 || reel2 == reel3 || reel1 == reel3 {
            2 // Two of a kind - 2x
        } else {
            0 // No win
        };

        let won = multiplier > 0;
        let payout: u64;

        if won {
            payout = bet_amount * multiplier as u64;
            
            let bump = [ctx.accounts.casino.vault_bump];
            let seeds = &[b"vault".as_ref(), bump.as_ref()];
            transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    SystemTransfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.player.to_account_info(),
                    },
                    &[&seeds[..]],
                ),
                payout,
            )?;
        } else {
            payout = 0;
        }

        let casino = &mut ctx.accounts.casino;
        casino.total_wagered += bet_amount;
        if won {
            casino.total_payout += payout;
        }

        // Use result field to encode all three reels
        let result = (reel1 as u8) * 100 + (reel2 as u8) * 10 + (reel3 as u8);

        emit!(GamePlayed {
            player: ctx.accounts.player.key(),
            game_type: 2, // 2 = slots
            bet_amount,
            prediction: 0,
            result,
            won,
            payout,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Fund the casino vault (admin only)
    pub fn fund_vault(ctx: Context<FundVault>, amount: u64) -> Result<()> {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                SystemTransfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Casino::LEN,
        seeds = [b"casino"],
        bump
    )]
    pub casino: Account<'info, Casino>,
    
    /// CHECK: This is the vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: SystemAccount<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlayGame<'info> {
    #[account(
        mut,
        seeds = [b"casino"],
        bump
    )]
    pub casino: Account<'info, Casino>,
    
    /// CHECK: This is the vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump = casino.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundVault<'info> {
    #[account(
        seeds = [b"casino"],
        bump,
        has_one = authority
    )]
    pub casino: Account<'info, Casino>,
    
    /// CHECK: This is the vault PDA
    #[account(
        mut,
        seeds = [b"vault"],
        bump = casino.vault_bump
    )]
    pub vault: SystemAccount<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Casino {
    pub authority: Pubkey,
    pub vault_bump: u8,
    pub total_wagered: u64,
    pub total_payout: u64,
    pub house_edge: u16,
    pub min_bet: u64,
    pub max_bet: u64,
}

impl Casino {
    pub const LEN: usize = 32 + 1 + 8 + 8 + 2 + 8 + 8;
}

#[event]
pub struct GamePlayed {
    pub player: Pubkey,
    pub game_type: u8, // 0=coin, 1=dice, 2=slots
    pub bet_amount: u64,
    pub prediction: u8,
    pub result: u8,
    pub won: bool,
    pub payout: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Bet amount is too low")]
    BetTooLow,
    #[msg("Bet amount is too high")]
    BetTooHigh,
    #[msg("Invalid prediction")]
    InvalidPrediction,
    #[msg("Invalid bet amount")]
    InvalidBetAmount,
}

