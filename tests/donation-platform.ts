import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {DonationPlatform} from "../target/types/donation_platform";

const {SystemProgram} = anchor.web3;

describe("Let's test donation platform!", () => {
  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.DonationPlatform as Program<DonationPlatform>;
  const donatePlatformKeypair = anchor.web3.Keypair.generate();
  const donatePlatform = donatePlatformKeypair.publicKey;
  const donatorKeypair = anchor.web3.Keypair.generate();
  const donator = donatorKeypair.publicKey;
  const owner = provider.wallet;
  const authority = owner.publicKey;
  const systemProgram = SystemProgram.programId;

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize(new anchor.BN(1000))
      .accounts( {
          donatePlatform,
          authority,
          systemProgram,
      })
      .signers([donatePlatformKeypair])
      .rpc();

    const data = await program.account.donates.fetch(donatePlatform);
    console.log(data);
    console.log("Your transaction signature", tx);
  });
  it("Sends!", async () => {
    const tx = await program.methods
      .send(new anchor.BN(1000))
      .accounts({
        donatePlatform,
        donator,
      })
      .signers([donatorKeypair])
      .rpc()
    console.log('Completed send!,', tx)
    const data = await program.account.donates.fetch(donatePlatform);
    console.log(data)
  });

  it("Withdraw", async () => {
    const tx = await program.methods
      .withdraw()
      .accounts({donatePlatform, authority})
      .rpc()
    const data = await program.account.donates.fetch(donatePlatform);
    console.log(data)

  });
});
