import type {web3} from "@project-serum/anchor";

export function shortAddress(address: web3.PublicKey) {
  const n = 7
  const addressStr = address.toString();
  return addressStr.slice(0, n) + '...' + addressStr.slice(-n)
}