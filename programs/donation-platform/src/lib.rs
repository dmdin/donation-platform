use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod donation_platform {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, target: u64) -> Result<()> {
        require!(target > 0, DonateErrors::ZeroLamports);
        let donate_platform = &mut ctx.accounts.donate_platform;
        donate_platform.authority = ctx.accounts.authority.key();
        donate_platform.target = target;
        donate_platform.collected = 0;
        donate_platform.reserved_ids = 1;

        Ok(())
    }

    pub fn send(ctx: Context<Send>, id: u64, amount: u64) -> Result<()>{
        require!(amount > 0, DonateErrors::ZeroLamports);

        let donate_platform = &ctx.accounts.donate_platform;
        let donator = &ctx.accounts.donator;

        let collected = donate_platform.collected;
        let target = donate_platform.target;
        require!(target > collected, DonateErrors::TargetReached);

        let (from, from_info) = (&donator.key(), donator.to_account_info());
        let (to, to_info) = (&donate_platform.key(), donate_platform.to_account_info());
        invoke(&transfer(from, to, amount), &[from_info, to_info])?;

        let donate_platform = &mut ctx.accounts.donate_platform;
        let donator_acc = &mut ctx.accounts.donator_acc;

        if  id == donate_platform.reserved_ids {
            donator_acc.address = ctx.accounts.donator.key();
            donator_acc.amount = 0;
            donator_acc.id = donate_platform.reserved_ids;

            donate_platform.reserved_ids += 1;
        }

        donator_acc.amount += amount;
        donate_platform.collected += amount;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()>{
        let collected = ctx.accounts.donate_platform.collected;
        require!(collected > 0, DonateErrors::NoCollectedLamports);

        let from = ctx.accounts.donate_platform.to_account_info();
        let to = ctx.accounts.authority.to_account_info();

        let rent_exemption = Rent::get()?.minimum_balance(Donates::SIZE);
        let withdraw_amount = **from.lamports.borrow() - rent_exemption;
        // require!(withdraw_amount < collected, DonateErrors::NoLamportsForRent);

        **from.try_borrow_mut_lamports()? -= withdraw_amount;
        **to.try_borrow_mut_lamports()? += withdraw_amount;
        ctx.accounts.donate_platform.collected = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Donates::SIZE,
        seeds = [b"donate_platform", authority.key().as_ref()],
        bump
    )]
    pub donate_platform: Account<'info, Donates>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"donate_platform", donate_platform.authority.key().as_ref()],
        bump
    )]
    pub donate_platform: Account<'info, Donates>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64, amount: u64)]
pub struct Send<'info>{
    // If client sends 0 it means, that there is no donator account
    #[account(mut)]
    pub donator: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        init_if_needed,
        payer = donator,
        space = Donator::SIZE,
        seeds = [
            b"donate_platform_donator",
            donate_platform.key().as_ref(),
            (if id == 0 {donate_platform.reserved_ids} else {id}).to_string().as_bytes()
        ],
        bump
    )]
    pub donator_acc: Account<'info, Donator>,

    #[account(
        mut,
        seeds = [b"donate_platform", donate_platform.authority.key().as_ref()],
        bump
    )]
    pub donate_platform: Account<'info, Donates>,
}

#[account]
pub struct Donates {
    pub authority: Pubkey,
    pub target: u64,
    pub collected: u64,
    // If user sends 0, give new id
    pub reserved_ids: u64,
}
impl Donates {
    pub const SIZE: usize = 8 + 32 + 8 * 3;
}

#[account]
pub struct Donator {
    address: Pubkey,
    amount: u64,
    id: u64,
}
impl Donator {
    pub const SIZE: usize = 8 + 32 + 8 * 2;
}

#[error_code]
pub enum DonateErrors {
    #[msg("Amount of lamports must be more than zero")]
    ZeroLamports,
    #[msg("Impossible to withdraw. No lamports were collected")]
    NoCollectedLamports,
    #[msg("The target was reached")]
    TargetReached,
    #[msg("Impossible to withdraw. Not enough lamports to pay rent")]
    NoLamportsForRent

}