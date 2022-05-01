import * as anchor from "@project-serum/anchor";
import { Idl, Program, web3 } from "@project-serum/anchor";
import { PDA } from "./pda";
import type {
  DonatePlatform,
  DonatesAcc,
  DonatorAcc,
  MakeDonation,
  PlatformDataProps,
  PlatformInit,
  Success
} from "./types";

export class Donates implements DonatePlatform {

  // Get them from constructor
  program: Program<Idl>;
  systemProgram: web3.PublicKey;

  // We can get this fields during init
  pda: PDA;
  donates: any;
  donator: any;
  top: any;

  // This fields we set when we know owner of platform
  authority: web3.PublicKey;
  donatePlatform: web3.PublicKey;
  topDonators: web3.PublicKey;

  constructor({ program, systemProgram }: PlatformInit) {
    this.program = program;
    this.donates = program.account.donates;
    this.donator = program.account.donator;
    this.top = program.account.topDonators;
    this.systemProgram = systemProgram;
    this.pda = new PDA(program.programId);
  }

  async setOwner(authority: web3.PublicKey | string): Promise<Success> {
    if (typeof authority === "string") {
      try {
        authority = new web3.PublicKey(authority);
      } catch (e) {
        console.error("The string is not public key!", e);
        return false;
      }
    }
    this.authority = authority;
    const [donatePlatform] = await this.pda.donatePlatform(authority);
    const [topDonators] = await this.pda.topDonators(authority);

    this.donatePlatform = donatePlatform;
    this.topDonators = topDonators;
    return true;
  }


  test() {
    const { donates, donatePlatform } = this;
    console.log(donates, donatePlatform);
  }

  async getPlatform(): Promise<DonatesAcc | undefined> {
    const { donates, donatePlatform } = this;
    if (!donates || !donatePlatform) return

    try {
      return await donates.fetch(donatePlatform);
    } catch (e) {
      console.error("Error during getting Donates account data:", e);
    }
  }

  async getDonator(id: number): Promise<DonatorAcc | undefined> {
    const { pda, donatePlatform, donator } = this;
    try {
      const donatorAcc = await pda.donatorAcc(donatePlatform, id);
      return await donator.fetch(donatorAcc);
    } catch (e) {
      console.error(`Error during getting Donator(id=${id}) account data:`, e);
    }
  }

  async getDonatorsOld(): Promise<DonatorAcc[]> {
    const { idCounter } = await this.getPlatform();
    if (idCounter == 0) return [];

    let donators = [];
    for (const i of Array(idCounter).keys()) {
      console.log(i)
      donators.push(this.getDonator(i));
    }
    donators = await Promise.all(donators);
    donators.sort((a: DonatorAcc, b: DonatorAcc) => a.amount - b.amount);
    return donators;
  }

  async getDonators(): Promise<DonatorAcc[]> {
    const top = (await this.top.fetch(this.topDonators)).donators;
    top.sort((a, b) => b.amount - a.amount);
    return top;
  }

  async getData(): Promise<PlatformDataProps | undefined> {
    const platform: DonatesAcc = await this.getPlatform();
    if (!platform) return;
    const donators: DonatorAcc[] = await this.getDonators();
    return {...platform, donators};
  }

  async send(donation: MakeDonation): Promise<Success> {
    const { address, amount, id } = donation;
    if (amount <= 0 || id < 0) return false;
    const { program, donatePlatform, topDonators, pda } = this;
    const [donatorAcc, ] = await pda.donatorAcc(donatePlatform, id);

    try {
      await program.methods
        .send(new anchor.BN(id), new anchor.BN(amount))
        .accounts({
          donator: address,
          donatorAcc,
          donatePlatform,
          topDonators,
        })
        .rpc();
      return true;
    } catch (e) {
      console.error("Error during sending:", e);
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
      console.error("Withdraw error:", e);
    }
    return false;
  }

  async initialize(target: number): Promise<Success> {
    if (target <= 0) return false;
    try {
      const { authority, systemProgram, program, donatePlatform, topDonators } = this;
      await program.methods
        .initialize(new anchor.BN(target))
        .accounts({
          donatePlatform,
          authority,
          systemProgram,
          topDonators
        })
        .rpc();
      return true;
    } catch (err) {
      console.error("Initialization error:", err);
    }
    return false;
  }
}
