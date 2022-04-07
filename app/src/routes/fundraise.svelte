<script lang="ts">
  import { platform, wallet } from "$lib/stores";
  import { fly } from "svelte/transition";
  import type { DonatesAcc } from "$lib/types";
  import {shortAddress} from '$lib/utils';
  
  let step = 0;
  let prevStep = 0;
  let target = 0;
  let ok: boolean
  let copied = false;
  
  let platformData: DonatesAcc;
  let donatersData: DonatesAcc[];
  
  $: if ($wallet && !ok) {
    loadPlatformData();
  }
  async function loadPlatformData() {
    ok = await $platform.setOwner($wallet.publicKey);
    if (!ok) return; // TODO Show error label
  
    platformData = (await $platform.getData());
    console.log(platformData.authority)
    if (platformData) step = 2;
  }
  
  async function setPlatformOwner() {

    prevStep = step;
    step++;
  }
  
  async function initPlatform() {
    if (target <= 0) {
      console.error('Target is eq or less 0')
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
    {:else if step === 2}
<!--      <div class="tooltip" data-tip="hello">-->
<!--        <button class="btn">Hover me</button>-->
<!--      </div>-->
      
      <div class="tooltip" tooltip-open={copied} data-tip="Copied!">
        <button
          class="hover:text-accent"
          on:click={() => copied = true}
        >
          {shortAddress(platformData.authority)}
        </button>
        {platformData.target.toString()}
        {platformData.idCounter}
        {platformData.collected}
      </div>
    {/if}
    
    {#if 0 < step && step < 2}
      <button
        class="btn btn-ghost"
        on:click={() => {prevStep = step; step--}}
        in:fly={{y: 10}}
      >
        Back
      </button>
    {/if}
    
  </div>
</div>