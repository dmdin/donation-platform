import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { PDA } from './pda';
import type { DonatePlatform } from './types';
import { Donates } from '$lib/index';

workSpace.subscribe(async update => {
  if (!update?.program || !update?.provider || !update?.systemProgram) return;

  const pda = new PDA(update.program.programId);
  const [donatePlatform] = await pda.donatePlatform(
    update.provider.wallet.publicKey,
  );

  platform.set(
    new Donates({
      donates: update.program.account.donates,
      donator: update.program.account.donator,
      program: update.program,
      authority: update.provider.wallet.publicKey,
      systemProgram: update.systemProgram.programId,
      donatePlatform,
      pda,
    }),
  );
});

export const platform: Writable<Donates> = writable();
