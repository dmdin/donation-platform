<script>
  import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
</script>

<div class="wallet-button-wrapper">
  <WalletMultiButton />
</div>

<style>
  :global(.wallet-button-wrapper .wallet-adapter-button-trigger) {
    @apply btn btn-sm btn-primary text-xs;
    width: 145px;
  }
  :global(.wallet-adapter-button-start-icon) {
    @apply mr-0;
  }
</style>
