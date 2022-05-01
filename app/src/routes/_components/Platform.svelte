<script lang="ts">
  import ShortAddress from "./ShortAddress.svelte";
  import { web3 } from "@project-serum/anchor";
  import type { DonatorAcc } from "$lib/types";
  
  export let title;
  export let authority: web3.PublicKey;
  export let collected: number;
  export let target: number;
  export let idCounter: number;
  export let donators: DonatorAcc[];
  
  if (target <= collected) {
    title = "✅ " + title;
  }
  
  const emojiForPlace = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "9️⃣", "🔟"];
  
</script>

<div class="flex flex-col items-center w-full">
  <h1 class="text text-center text-md font-bold">{title}</h1>
  <ShortAddress address={authority} />
  <h2 class="text-xs font-bold mt-5">Collected Lamports</h2>
  <h2 class="text-xs mt-1">{collected} / {target}</h2>
  <progress
    class="progress w-56 progress-accent mt-2"
    value={collected}
    max={target}>
  </progress>
  
<!--  Control amd donate interface for different types -->
  <div class="my-5">
    <slot/>
  </div>
  <div class="w-full overflow-y-auto">
    {#each donators as {address, amount}, i}
      <div class="flex justify-between text-xs">
        <div>
          {emojiForPlace[i]}
          <ShortAddress {address}/>
        </div>
        <h3>{amount} Lamps</h3>
      </div>
    {/each}
  </div>
</div>