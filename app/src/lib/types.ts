import type { Idl, Program, web3 } from '@project-serum/anchor';
import type { PDA } from './pda';

export interface Basic {
  donates;
  donator;
  pda: PDA;
  program: Program<Idl>;
}

export interface PlatformInit {
  program: Program<Idl>;
  systemProgram: web3.PublicKey;
}

export interface Donator extends Basic {
  sender: web3.PublicKey;
  receiver: web3.PublicKey;
}

export interface DonatePlatform extends Basic {
  authority: web3.PublicKey;
  systemProgram: web3.PublicKey;
  donatePlatform: web3.PublicKey;
}

export interface DonatesAcc {
  authority: web3.PublicKey;
  target: number;
  collected: number;
  idCounter: number;
}

export interface DonatorAcc {
  address: web3.PublicKey;
  amount: number;
}

export interface PlatformDataProps extends DonatesAcc{
  donators: DonatorAcc[]
}

export interface MakeDonation extends DonatorAcc {
  id: number;
}

export type Success = boolean;
