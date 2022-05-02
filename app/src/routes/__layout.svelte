<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { clusterApiUrl } from "@solana/web3.js";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import WalletButton from "./_components/WalletButtonWrapper.svelte";
  import Fa from "svelte-fa";
  import { faBars, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
  import { AnchorConnectionProvider } from "@svelte-on-solana/wallet-adapter-anchor";
  import idl from "$lib/donation_platform.json";
  
  import { Buffer } from 'buffer';
  global.Buffer = Buffer;
  
  const localStorageKey = "walletAdapter";
  const network = clusterApiUrl("devnet");
  
  let wallets;
  
  onMount(async () => {
    const {
      PhantomWalletAdapter,
      SlopeWalletAdapter,
      SolflareWalletAdapter,
      SolletExtensionWalletAdapter
    } = await import("@solana/wallet-adapter-wallets");
    
    const walletsMap = [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletExtensionWalletAdapter()
    ];
    
    wallets = walletsMap;
  });
  
  let theme: "light" | "night" = "light";
  $: path = $page.url.pathname;
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl} />
<div data-theme={theme} class="h-screen grid place-items-center bg-base-200">
  <div class="screen artboard phone-3 rounded-2xl bg-base-100">
    <div class="navbar bg-base">
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost btn-circle">
            <Fa icon={faBars} size="lg" />
          </label>
          <ul
            tabindex="0"
            class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a
                class:text-accent-focus={path === '/'}
                href="/">Home</a
              >
            </li>
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
        
        {#if theme === 'light'}
          <button
            class="btn btn-ghost btn-circle"
            on:click={() => theme = 'night'}
          >
            <Fa icon={faSun} size="lg" />
          </button>
        {:else}
          <button
            class="btn btn-ghost btn-circle"
            on:click={() => theme = 'light'}
          >
            <Fa icon={faMoon} size="lg" />
          </button>
        {/if}
      </div>
      <div class="navbar-end btn-sm text-sm">
        <WalletButton />
      </div>
    </div>
    <slot />
  </div>
</div>

<style>
  .screen {
    width: 100%;
    height: 100%;
    max-width: 375px;
    max-height: 667px;
  }
</style>