import type { Idl, Program, web3 } from '@project-serum/anchor';
import type { PDA } from './pda';

interface Basic {
  donates;
  donator;
  pda: PDA;
  program: Program<Idl>;
}

interface Donator extends Basic {
  sender: web3.PublicKey;
  receiver: web3.PublicKey;
}

interface DonatePlatform extends Basic {
  authority: web3.PublicKey;
  systemProgram: web3.PublicKey;
  donatePlatform: web3.PublicKey;
}

interface DonatesAcc {
  authority: web3.PublicKey;
  target: number;
  collected: number;
  idCounter: number;
}

interface DonatorAcc {
  address: web3.PublicKey;
  amount: number;
  id: number;
}

type MakeDonation = DonatorAcc;

type Success = boolean;

export type {
  DonatePlatform,
  DonatesAcc,
  MakeDonation,
  DonatorAcc,
  Success,
  PDA,
};
