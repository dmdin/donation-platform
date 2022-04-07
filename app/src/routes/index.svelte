<script lang="ts">
  // import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
  // import { walletStore } from '@svelte-on-solana/wallet-adapter-core';

  enum Mode {
    Donates = 'donates',
    Donator = 'donator',
  }
  let mode: Mode = Mode.Donates;

  let donators = [];
</script>

<div class="wrapper-app">
  <div class="address">
    <button
      class="btn btn-primary"
      on:click={() =>
        mode === Mode.Donates ? (mode = Mode.Donator) : (mode = Mode.Donates)}
    >
      Change
    </button>
    {#if mode === Mode.Donates}
      <button class="btn btn-primary">Create</button>
    {/if}
  </div>
</div>

<style>
</style>
