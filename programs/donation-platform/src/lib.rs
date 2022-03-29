use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod donation_platform {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>,
                      // bump: u8,
                      target: u64) -> Result<()>
    {
        let donate_platform = &mut ctx.accounts.donate_platform;
        // donate_platform.bump = bump;
        donate_platform.authority = *ctx.accounts.authority.to_account_info().key;
        donate_platform.target = target;
        donate_platform.collected = 0;
        Ok(())
    }

    pub fn send(ctx: Context<Send>, amount: u64) -> Result<()>{
        let address = ctx.accounts.donator.key();
        let donation = Donation {address, amount};
        msg!("{:?}", donation);
        let donate_platform = &mut ctx.accounts.donate_platform;
        donate_platform.donators.push(donation);
        donate_platform.collected += amount;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()>{
        ctx.accounts.donate_platform.collected = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(init, payer = authority, space = 64 + 64)]
    // seeds = [b"donate_platform", authority.key().as_ref()], bump

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
    // #[account(mut, seeds=[b"donate_platform", receiver.to_bytes()], bump = donate_platform.bump)]
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