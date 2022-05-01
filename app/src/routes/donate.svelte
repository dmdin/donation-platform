<script lang="ts">
  import { othersAddress, platform, wallet } from "$lib/stores";
  import Fa from "svelte-fa";
  import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
  import Platform from "./_components/Platform.svelte";
  import { fly } from "svelte/transition";
  
  let ok: boolean;
  let amount: number;
  let step = 1;
  let address = $othersAddress;
  let dataPromise = address ? findFundraiser() : Promise.resolve(undefined);
  
  // 29mQ1f4CvW8zJT4cDRcsZv3FsNRX16FNFfubFXDHCND3
  async function findFundraiser() {
    if (!address) return;
    ok = await $platform.setOwner(address);
    if (!ok) return;
    othersAddress.set(address);
    dataPromise = $platform.getData();
  }
  
  async function donate(id: number){
    if (typeof amount !== "number") return;
    
    console.log($wallet.publicKey.toString())
    ok = await $platform.send({
      address: $wallet.publicKey,
      amount,
      id: 0,
    })
    if (!ok) return;
  //  TODO make an error bar
    dataPromise = $platform.getData();
  }
</script>

<div class="m-auto flex flex-col w-80 mt-4">
  <h1 class="text text-center text-xl font-bold my-3">Find Fundraise</h1>
  <label class="flex items-center">
    <input
      bind:value={address}
      class="input input-accent input-sm input-bordered w-full"
      placeholder="Fundraiser address"
    />
    
    <button class="btn btn-sm btn-ghost btn-circle" on:click={findFundraiser}>
      <Fa icon={faMagnifyingGlass} size="lg" />
    </button>
  </label>
  <div class="mt-20">
    {#await dataPromise}
      <h2 class="text-center">Loading...</h2>
    {:then data}
      {#if data}
        <Platform {...data} title="Other's Fundraise">
          {#if step === 0}
            <button
              class="btn btn-primary btn-outline btn-sm"
              on:click={() => step++}
            >
              Donate
            </button>
          {:else}
            <div class="flex flex-col items-center" in:fly={{x: 10}}>
              <h3 class="my-1 text-xs">Enter donation amount</h3>
              <input
                class="input input-accent input-sm w-32" type="number" min="1"
                pattern="[0-9]*" inputmode="numeric"
                placeholder="100"
                bind:value={amount}>
              <button
                class="btn btn-primary btn-outline btn-sm mt-2"
                disabled={!amount}
                on:click={donate}
              >
                Donate
              </button>
            </div>
          {/if}
        </Platform>
      {/if}
    {/await}
  </div>
</div>
