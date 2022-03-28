import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DonationPlatform } from "../target/types/donation_platform";
import assert from "assert";

describe("Let's test donation platform!", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.DonationPlatform as Program<DonationPlatform>;
  const owner = program.provider.wallet;
  const programKeys = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.

    const tx = await program.methods.initialize(1000).accounts( {
        donatePlatform: programKeys.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }).signers([programKeys, ]);
    // const data = await program.account.donates.fetch(programKeys.publicKey)
    // console.log(data)
    console.log("Your transaction signature", tx);

  });
});
