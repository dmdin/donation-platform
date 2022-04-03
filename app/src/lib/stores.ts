import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { PDA } from './pda';
import type { DonatePlatfrom } from './types';

export let data: Writable<DonatePlatfrom> = writable();

workSpace.subscribe(async (update) => {
  if (!update?.program || !update?.provider || !update?.systemProgram) return;

  let pda = new PDA(update.program.programId);
  let [donatePlatform] = await pda.donatePlatform(update.provider.wallet.publicKey);

  data.set({
    donates: update.program.account.donates,
    donator: update.program.account.donator,
    program: update.program,
    authority: update.provider.wallet.publicKey,
    systemProgram: update.systemProgram.programId,
    donatePlatform,
    pda,
  });
});