<script lang='ts'>
  import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
  import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
  
  import { fly } from 'svelte/transition';
  import { data } from '$lib/stores';
  import { Donates } from '$lib';
  
  let value;
  let donates: Donates;
  
  $: console.log('value: ', value);
  $: if ($data && !donates) {
    donates = new Donates($data);
    donates.getData().then(r => console.log(r));
  }

</script>

<div class='wrapper-app'>
  <div class='title'>
  
  </div>
  
  <div class='address'>
    <WalletMultiButton />
  </div>
  
  {#if $walletStore?.connected}
    <div class='wrapper-content'>
      {#if value}
        <button on:click={() => {}}>Increment</button>
        <p class='value'>
          Value:
          {#key value}
            <span
              in:fly={{ duration: 500, y: -100 }}
              out:fly={{ duration: 500, y: 100 }}>{value}</span
            >
          {/key}
        </p>
      {:else}
        <button class='btn btn-primary' on:click={() => {}}>Create counter</button>
      {/if}
    </div>
    <p class='warning'>You are connected to DevNet!</p>
  {:else}
    <p class='warning'>You are not connected...</p>
  {/if}
</div>

<style>

</style>
