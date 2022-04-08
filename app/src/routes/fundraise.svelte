<script lang="ts">
  import { platform, wallet } from "$lib/stores";
  import { fly } from "svelte/transition";
  import type { DonatesAcc } from "$lib/types";
  import ShortAddress from "./_components/ShortAddress.svelte";
  import { DonatorAcc } from "$lib/types";
  
  let step = 0;
  let prevStep = 0;
  let target = 0;
  let ok: boolean;
  let copied = false;
  
  let platformData: DonatesAcc;
  let donatersData: DonatorAcc[] = [];
  
  $: if ($wallet) {
    loadPlatformData();
  }
  
  async function loadPlatformData() {
    ok = await $platform.setOwner($wallet.publicKey);
    if (!ok) return; // TODO Show error label
    platformData = (await $platform.getData());
    donatersData = (await $platform.getDonators());
    if (platformData) step = 2;
    
  }
  
  async function setPlatformOwner() {
    
    prevStep = step;
    step++;
  }
  
  async function initPlatform() {
    if (target <= 0) {
      console.error("Target is eq or less 0");
      return;
    }
    // TODO Show error label
    ok = await $platform.initialize(target);
    if (!ok) return;
  }

</script>

<div class="flex flex-col items-center h-4/6">
  <h1 class="text text-center text-xl font-bold mt-40">My Fundraise</h1>
  <div class="flex flex-col items-center justify-between h-80 mt-2">
    {#if step === 0}
      <div
        class="flex flex-col items-center"
        in:fly={{x: 10 * (step - prevStep)}}
      >
        <h2>Create fundraiser in two clicks</h2>
        <button
          disabled={!$wallet}
          class="btn btn-accent text-base-100 mt-6"
          on:click={setPlatformOwner}
        >
          Create
        </button>
        {#if !$wallet}
          <h2 class="text-accent mt-5">Connect wallet to create Fundraise</h2>
        {/if}
      
      </div>
    {:else if step === 1}
      <div
        class="flex flex-col items-center"
        in:fly={{x: 10 * (step - prevStep)}}
      >
        <h2>Enter the target of fundraise in Lamports</h2>
        <input
          class="input input-accent w-40 mt-3" type="number" min="0"
          bind:value={target}
        >
        <button
          class="btn btn-accent text-base-100 mt-6"
          on:click={initPlatform}
        >
          Create
        </button>
      </div>
    {#if 0 < step && step < 2}
      <button
        class="btn btn-ghost"
        on:click={() => {prevStep = step; step--}}
        in:fly={{y: 10}}
      >
        Back
      </button>
    {/if}
    
    {:else if step === 2 && platformData}
      <div class="flex flex-col items-center">
        <ShortAddress address={platformData.authority} />
        <h2 class="text-xs font-bold mt-5">Collected Lamports</h2>
        <h2 class="text-xs mt-1">{platformData.collected} / {platformData.target}</h2>
        <progress
          class="progress w-56 progress-accent mt-2"
          value={platformData.collected}
          max={platformData.target}>
        </progress>
        <div class="overflow-y-auto">
          {#each donatersData as don}
            <h3>{don}</h3>
            <h3>{don.id}</h3>
            <h3>{don.address}</h3>
            <h3>{don.amount}</h3>
            
          {/each}
        </div>
      </div>
    {/if}
    

  
  </div>
</div>