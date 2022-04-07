import type { Idl, Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import type { PDA } from './pda';
import type {
  DonatePlatform,
  DonatesAcc,
  DonatorAcc,
  MakeDonation,
  Success,
} from './types';

export class Donates implements DonatePlatform {
  donates: any;
  donator: any;
  pda: PDA;
  program: Program<Idl>;
  authority: web3.PublicKey;
  systemProgram: web3.PublicKey;
  donatePlatform: web3.PublicKey;

  constructor(data: DonatePlatform) {
    Object.assign(this, data);
  }

  test() {
    const { donates, donatePlatform } = this;
    console.log(donates, donatePlatform);
  }

  async getData(): Promise<DonatesAcc | undefined> {
    const { donates, donatePlatform } = this;
    try {
      return await donates.fetch(donatePlatform);
    } catch (e) {
      console.log('Error during getting Donates account data:', e);
    }
  }

  async getDonator(id: number): Promise<DonatorAcc | undefined> {
    const { pda, donatePlatform, donator } = this;
    try {
      const donatorAcc = await pda.donatorAcc(donatePlatform, id);
      return await donator.fetch(donatorAcc);
    } catch (e) {
      console.log(`Error during getting Donator(id=${id}) account data:`, e);
    }
  }

  async getDonators(): Promise<DonatorAcc[]> {
    const { idCounter } = await this.getData();
    let donators = [];
    for (const i of Array(idCounter).keys()) {
      donators.push(this.getDonator(i));
    }
    donators = await Promise.all(donators);
    donators.sort((a: DonatorAcc, b: DonatorAcc) => a.amount - b.amount);
    return donators;
  }

  async send(donation: MakeDonation): Promise<Success> {
    const { address, amount, id } = donation;
    if (amount <= 0 || id < 0) return false;
    const { program, donatePlatform, pda } = this;
    const donatorAcc = await pda.donatorAcc(donatePlatform, id);

    try {
      await program.methods
        .send(new anchor.BN(id), new anchor.BN(amount))
        .accounts({
          donator: address,
          donatorAcc,
          donatePlatform,
        })
        .rpc();

      return true;
    } catch (e) {
      console.log('Error during sending:', e);
    }
    return false;
  }

  async withdraw(): Promise<Success> {
    const { program, donatePlatform, authority } = this;
    try {
      await program.methods
        .withdraw()
        .accounts({ donatePlatform, authority })
        .rpc();
      return true;
    } catch (e) {
      console.log('Withdraw error:', e);
    }
    return false;
  }

  async initialize(target: number): Promise<Success> {
    if (target <= 0) return false;

    try {
      const { authority, pda, systemProgram, program, donatePlatform } = this;
      await program.methods
        .initialize(new anchor.BN(target))
        .accounts({
          donatePlatform,
          authority,
          systemProgram,
        })
        .rpc();
      return true;
    } catch (err) {
      console.log('Initialization error:', err);
    }
    return false;
  }
}
