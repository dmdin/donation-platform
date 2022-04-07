<script lang="ts">
  import { platform } from '$lib/stores';
  import Fa from 'svelte-fa';
  import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
  
  let ok: boolean
  let address;
  
  async function findFundraiser() {
    ok = await $platform.setOwner(address);
    if (!ok) return;
    
    
    // let data = await $platform.getData();
    //
    // console.log(data.idCounter)
    // console.log(data.authority)
    // console.log(data.collected)
    // console.log(data.target)
  }
</script>

<div class="m-auto flex flex-col w-80 mt-4">
  <h1 class="text text-center text-xl font-bold my-3">Donate</h1>
  <label class="flex items-center">
    <input
      bind:value={address}
      class="input input-accent input-sm input-bordered w-full"
      placeholder="Fundraiser address"
    />

    <button class="btn btn-sm btn-ghost btn-circle" on:click={findFundraiser}>
      <Fa icon={faMagnifyingGlass} size="lg"/>
<!--      <svg-->
<!--        xmlns="http://www.w3.org/2000/svg"-->
<!--        class="h-5 w-5"-->
<!--        fill="none"-->
<!--        viewBox="0 0 24 24"-->
<!--        stroke="currentColor"-->
<!--      >-->
<!--        <path-->
<!--          stroke-linecap="round"-->
<!--          stroke-linejoin="round"-->
<!--          stroke-width="2"-->
<!--          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"-->
<!--        />-->
<!--      </svg>-->
    </button>
  </label>
  <!--		<label class="flex items-center justify-between">-->
  <!--			<input class="input input-accent" type="number" min="0">-->
  <!--			<span>Lamports</span>-->
  <!--		</label>-->
  <!--		<button class="mt-4 btn btn-primary">Send</button>-->
</div>
