use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke;

declare_id!("73nLsFDxG2nqXaQMMcBpbgPZgtJdSAGF7XhEYbE9Kcdo");

#[program]
pub mod donation_platform {
    use std::u64;
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, target: u64) -> Result<()> {
        require!(target > 0, DonateErrors::ZeroLamports);
        let donate_platform = &mut ctx.accounts.donate_platform;
        donate_platform.authority = ctx.accounts.authority.key();
        donate_platform.target = target;
        donate_platform.collected = 0;
        donate_platform.id_counter = 0;

        let top_donators = &mut ctx.accounts.top_donators;
        top_donators.donators = vec![];

        Ok(())
    }

    pub fn send(ctx: Context<Send>, id: u64, amount: u64) -> Result<()>{
        require!(amount > 0, DonateErrors::ZeroLamports);
        let donate_platform = &ctx.accounts.donate_platform;
        require!(id <= donate_platform.id_counter, DonateErrors::IDBiggerThanCounter);

        let donator = &ctx.accounts.donator;

        let collected = donate_platform.collected;
        let target = donate_platform.target;
        require!(target > collected, DonateErrors::TargetReached);

        let (from, from_info) = (&donator.key(), donator.to_account_info());
        let (to, to_info) = (&donate_platform.key(), donate_platform.to_account_info());
        invoke(&transfer(from, to, amount), &[from_info, to_info])?;

        let donate_platform = &mut ctx.accounts.donate_platform;
        let donator_acc = &mut ctx.accounts.donator_acc;

        let mut _id = id;
        if _id == 0 {
            _id = donate_platform.id_counter;
        }

        if  _id == donate_platform.id_counter {
            donator_acc.address = ctx.accounts.donator.key();
            donator_acc.amount = 0;

            donate_platform.id_counter += 1;
        }

        donator_acc.amount += amount;
        donate_platform.collected += amount;

        let top_donators = &mut ctx.accounts.top_donators;
        let (cur_amount, mut cur_i) = (donator_acc.amount, 0);
        let (mut min, mut min_i) = (u64::MAX,  TopDonators::MAX_DONATORS);
        let mut found = false;
        for (i, don) in top_donators.donators.iter().enumerate() {
            if don.amount < min {
                min = don.amount;
                min_i = i;
            }
            if don.address == donator_acc.address {
                cur_i = i;
                found = true;
                break;
            }
        }

        if !found {
            let donator_instance = DonatorStruct {
                amount: donator_acc.amount,
                address: donator_acc.address
            };

            if top_donators.donators.len() < TopDonators::MAX_DONATORS {
                top_donators.donators.push(donator_instance);
            } else if min < cur_amount {
                top_donators.donators[min_i] = donator_instance;
            }
        } else {
            top_donators.donators[cur_i].amount = cur_amount;
        }

        emit!(DonationEvent{
            at: Clock::get()?.unix_timestamp,
            amount: amount,
            platform_after: donate_platform.collected,
            from: donator_acc.address
        });
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

        emit!(WithdrawEvent{
            at: Clock::get()?.unix_timestamp,
            amount: withdraw_amount
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(target: u64)]
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

    #[account(
        init,
        payer = authority,
        space = TopDonators::SIZE,
        seeds = [b"top_donators", authority.key().as_ref()],
        bump
    )]
    pub top_donators: Account<'info, TopDonators>,
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
            id.to_string().as_bytes()
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

    #[account(
        mut,
        seeds = [b"top_donators", donate_platform.authority.key().as_ref()],
        bump
    )]
    pub top_donators: Account<'info, TopDonators>,
}

// ---------------------------------------------------------------
#[account]
pub struct Donates {
    pub authority: Pubkey,
    pub target: u64,
    pub collected: u64,
    // If user sends 0, give new id
    pub id_counter: u64,
}
impl Donates {
    // Discriminator + PubKey + u64 + u64 + u64
    pub const SIZE: usize = 8 + 32 + 8 * 3;
}

#[account]
pub struct Donator {
    pub address: Pubkey,
    pub amount: u64,
}

impl Donator {
    // Discriminator + PubKey + u64
    pub const SIZE: usize = 8 + 32 + 8;
}

// Anchor throws IdlError if we reuse existing struct with account macro
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct DonatorStruct {
    pub address: Pubkey,
    pub amount: u64,
}

#[account]
pub struct TopDonators {
    pub donators: Vec<DonatorStruct>
}

impl TopDonators {
    pub const MAX_DONATORS: usize = 10;
    // Discriminator + Vec + (PubKey + u64) * Donators Amount
    pub const SIZE: usize = 8 + 4 + (32 + 8) * TopDonators::MAX_DONATORS;
}

// ---------------------------------------------------------------
#[error_code]
pub enum DonateErrors {
    #[msg("Amount of lamports must be more than zero")]
    ZeroLamports,
    #[msg("Impossible to withdraw. No lamports were collected")]
    NoCollectedLamports,
    #[msg("The target was reached")]
    TargetReached,
    #[msg("Impossible to withdraw. Not enough lamports to pay rent")]
    NoLamportsForRent,
    #[msg("Passed ID is bigger than current ID counter")]
    IDBiggerThanCounter
}

#[event]
pub struct DonationEvent {
    at: i64,
    amount: u64,
    platform_after: u64,
    from: Pubkey,
}

#[event]
pub struct WithdrawEvent {
    at: i64,
    amount: u64,
}