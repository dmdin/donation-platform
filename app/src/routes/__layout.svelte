<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { clusterApiUrl } from '@solana/web3.js';
  import {
    WalletMultiButton,
    WalletProvider,
  } from '@svelte-on-solana/wallet-adapter-ui';
  import WalletButton from './_components/WalletButtonWrapper.svelte';

  import { AnchorConnectionProvider } from '@svelte-on-solana/wallet-adapter-anchor';
  import idl from '../../../target/idl/donation_platform.json';

  const localStorageKey = 'walletAdapter';
  const network = clusterApiUrl('devnet');

  let wallets;

  onMount(async () => {
    const {
      PhantomWalletAdapter,
      SlopeWalletAdapter,
      SolflareWalletAdapter,
      SolletExtensionWalletAdapter,
    } = await import('@solana/wallet-adapter-wallets');

    const walletsMap = [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletExtensionWalletAdapter(),
    ];

    wallets = walletsMap;
  });
  $: path = $page.url.pathname;
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl} />
<div class="h-screen grid place-items-center bg-base-200">
  <div class="artboard phone-3 rounded-2xl bg-base-100">
    <div class="navbar bg-base">
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <ul
            tabindex="0"
            class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a
                class:text-accent-focus={path === '/fundraise'}
                href="/fundraise">Fundraise</a
              >
            </li>
            <li>
              <a class:text-accent-focus={path === '/donate'} href="/donate"
                >Donate</a
              >
            </li>
          </ul>
        </div>
      </div>
      <!--			<div class="navbar-center">-->
      <!--				<a href="/" class="btn btn-ghost normal-case text-xl">SolDonuts🍩</a>-->
      <!--			</div>-->
      <div class="navbar-end btn-sm text-sm">
        <WalletButton />
      </div>
    </div>
    <slot />
  </div>
</div>
