use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke;
use anchor_lang;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod donation_platform {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, target: u64) -> Result<()> {
        require!(target > 0, DonateErrors::ZeroLamports);
        let donate_platform = &mut ctx.accounts.donate_platform;
        // donate_platform.bump = bump;
        donate_platform.authority = ctx.accounts.authority.key();
        donate_platform.target = target;
        donate_platform.collected = 0;
        Ok(())
    }

    pub fn send(ctx: Context<Send>, amount: u64) -> Result<()>{
        require!(amount > 0, DonateErrors::ZeroLamports);

        let donate_platform = &ctx.accounts.donate_platform;
        let collected = donate_platform.collected;
        let target = donate_platform.target;
        require!(target > collected, DonateErrors::TargetReached);

        let (from, from_info) = (&ctx.accounts.donator.key(), ctx.accounts.donator.to_account_info());
        let (to, to_info) = (&ctx.accounts.donate_platform.key(), ctx.accounts.donate_platform.to_account_info());
        invoke(&transfer(from, to, amount), &[from_info, to_info])?;

        let donation = Donation {address: *from, amount};
        let donate_platform = &mut ctx.accounts.donate_platform;

        donate_platform.donators.push(donation);
        donate_platform.collected += amount;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()>{
        let collected = ctx.accounts.donate_platform.collected;
        require!(collected > 0, DonateErrors::NoCollectedLamports);

        let (from, from_info) = (&ctx.accounts.donate_platform.key(), ctx.accounts.donate_platform.to_account_info());
        let (to, to_info) = (&ctx.accounts.authority.key(), ctx.accounts.authority.to_account_info());
        invoke(&transfer(from, to, collected), &[from_info, to_info])?;

        ctx.accounts.donate_platform.collected = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, payer = authority, space = 64 + 64, seeds = [b"donate_platform", authority.key().as_ref()], bump)]
    pub donate_platform: Account<'info, Donates>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = authority)]
    pub donate_platform: Account<'info, Donates>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Send<'info>{
    pub donator: Signer<'info>,
    // #[account(mut, bump = donate_platform.bump)]
    #[account(mut)]
    pub donate_platform: Account<'info, Donates>
}

#[account]
pub struct Donates {
    pub authority: Pubkey,
    // pub bump: u8,
    pub target: u64,
    pub collected: u64,
    pub donators: Vec<Donation>,
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct Donation {
    address: Pubkey,
    amount: u64,
}

#[error_code]
pub enum DonateErrors {
    #[msg("Amount of lamports must be more than zero")]
    ZeroLamports,
    #[msg("Impossible to withdraw. No lamports were collected")]
    NoCollectedLamports,
    #[msg("The target was reached")]
    TargetReached,

}