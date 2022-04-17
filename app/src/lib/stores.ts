import { workSpace } from "@svelte-on-solana/wallet-adapter-anchor";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { Wallet } from "@project-serum/anchor/src/provider";
import { Donates } from "$lib/index";
import type { PublicKey } from "@solana/web3.js";

export const platform: Writable<Donates> = writable();
export const wallet: Writable<Wallet> = writable();
export const othersAddress: Writable<PublicKey> = writable();


workSpace.subscribe(async update => {
  if (!update?.program || !update?.provider || !update?.systemProgram) return;

  wallet.set(update.provider.wallet);

  platform.set(
    new Donates({
      program: update.program,
      systemProgram: update.systemProgram.programId
    })
  );
});
