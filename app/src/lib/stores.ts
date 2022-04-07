import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { PDA } from './pda';
import type { DonatePlatform } from './types';
import { Donates } from '$lib/index';

workSpace.subscribe(async update => {
  if (!update?.program || !update?.provider || !update?.systemProgram) return;

  platform.set(
    new Donates({
      program: update.program,
      systemProgram: update.systemProgram.programId,
    }),
  );
});

export const platform: Writable<Donates> = writable();
