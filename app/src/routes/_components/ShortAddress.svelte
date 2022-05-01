<script lang="ts">
  import { shortAddress } from "$lib/utils";
  import type { web3 } from "@project-serum/anchor";
  
  export let address: web3.PublicKey;
  let className = '';
  export { className as class};
  let tip = "Click to copy";
  
  function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(
      () => tip = "Copied address!",
      () => tip = "Failed to copy"
    );
  }

</script>

<div
  class="tooltip {className}"
  data-tip={tip}
>
  <button
    class="hover:text-accent"
    on:click={() => updateClipboard(address.toString())}
    on:mouseleave={() => setTimeout(() => tip = "Click to copy", 1000)}
  >
    {shortAddress(address)}
  </button>
</div>
