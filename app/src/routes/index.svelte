<script lang="ts">
  // import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
  // import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
  import DonutIcon from "./_components/DonutIcon.svelte";
</script>

<div class="h-3/5 flex flex-col items-center justify-center">
  <div class="flex flex-col items-center">
    <DonutIcon />
    <h1 class="text-2xl font-bold text-center text-primary">Welcome to SolDons</h1>
    <h2 class="text-md mt-1 text-center text">Fundraise Solana Lamports with ease of One click!</h2>
    <div class="flex justify-center">
      <a class="m-3 btn btn-outline btn-sm" href="/donate">Donate</a>
      <a class="m-3 btn btn-outline btn-sm" href="/fundraise">Fundraise</a>
    </div>
  </div>
</div>

<style>

</style>
