import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
import type { Writable } from 'svelte/store';
import type {Wallet} from '@project-serum/anchor/src/provider'
import { writable } from 'svelte/store';
import { Donates } from '$lib/index';

workSpace.subscribe(async update => {
  if (!update?.program || !update?.provider || !update?.systemProgram) return;

  wallet.set(update.provider.wallet);

  platform.set(
    new Donates({
      program: update.program,
      systemProgram: update.systemProgram.programId,
    }),
  );
});

export const platform: Writable<Donates> = writable();
export const wallet: Writable<Wallet> = writable();