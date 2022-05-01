<script lang="ts">
  import { platform, wallet } from "$lib/stores";
  import { fly } from "svelte/transition";
  import Platform from "./_components/Platform.svelte";
  
  let step = 0;
  let prevStep = 0;
  let target;
  let ok: boolean;
  
  let data;
  $: if ($wallet) {
    loadPlatformData();
  }
  
  async function loadPlatformData() {
    ok = await $platform.setOwner($wallet.publicKey);
    if (!ok) return; // TODO Show error label
    data = await $platform.getData();
    if (data) step = 2;
  }
  
  async function withdraw() {
    await $platform.withdraw();
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
    await loadPlatformData()
  }

</script>

<div class="flex flex-col items-center h-4/6">
  <h1 class="text text-center text-xl font-bold mt-40 mb-2">My Fundraise</h1>
  <div class="flex flex-col items-center justify-between h-80 w-80">
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
          pattern="[0-9]*" inputmode="numeric" placeholder="10000"
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
    
    {:else if step === 2 && data}
      <Platform {...data} title="To buy tasty 🍩">
        <button
          class="btn btn-primary btn-outline btn-sm"
          on:click={withdraw}
        >
          Withdraw
        </button>
      </Platform>
    {/if}
  </div>
</div>