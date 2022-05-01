import { web3 } from '@project-serum/anchor';
import * as anchor from "@project-serum/anchor";

export class PDA {
  programId: web3.PublicKey;

  constructor(programId: web3.PublicKey) {
    this.programId = programId;
  }

  async donatePlatform(authority: web3.PublicKey) {
    return await web3.PublicKey.findProgramAddress(
      [Buffer.from('donate_platform'), authority.toBuffer()],
      this.programId,
    );
  }

  async topDonators(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("top_donators"), authority.toBuffer()],
      this.programId
    );
  }

  async donatorAcc(donatePlatform: web3.PublicKey, id: number) {
    return await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('donate_platform_donator'),
        donatePlatform.toBuffer(),
        Buffer.from(id.toString()),
      ],
      this.programId,
    );
  }
}
