import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {DonationPlatform} from "../target/types/donation_platform";
import chai from "chai";
import {expect, assert} from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const {SystemProgram} = anchor.web3;

describe("Let's test donation platform!", async () => {
  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.DonationPlatform as Program<DonationPlatform>;
  const systemProgram = SystemProgram.programId;
  // const donatePlatformKeypair = anchor.web3.Keypair.generate();
  // const donatePlatform = donatePlatformKeypair.publicKey;
  let owner = provider.wallet;
  let authority = owner.publicKey;

  let [donatePlatform, donatePlatformBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("donate_platform"), authority.toBuffer()], program.programId
  )

  let donatorKeypair = anchor.web3.Keypair.generate();
  let donator = donatorKeypair.publicKey;

  it("Program must throw error with target 0", async () => {
    await expect((async () =>
        await program.methods
          .initialize(new anchor.BN(0))
          .accounts({
            donatePlatform,
            authority,
            systemProgram,
          })
          .rpc()
      )()
    ).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  });

  it("Program is initialized correctly", async () => {
    let tx = await program.methods
      .initialize(new anchor.BN(1000))
      .accounts( {
          donatePlatform,
          authority,
          systemProgram,
      })
      .rpc();

    let donates = await program.account.donates.fetch(donatePlatform);
    assert.equal(donates.target, 1000, "Targets are not the same!");
    assert.deepEqual(donates.authority, authority, "Authorities are not the same!")
    assert.equal(donates.collected, 0, "Collected amount is not zero!")
  });

  // it("Sends lamports", async () => {
  //   const tx = await program.methods
  //     .send(new anchor.BN(100))
  //     .accounts({
  //       donator,
  //       donatePlatform,
  //     })
  //     .signers([donatorKeypair])
  //     .rpc()
  //   console.log('Completed send!,', tx)
  //   const data = await program.account.donates.fetch(donatePlatform);
  //   console.log(data)
  // });
  //
  // it("Withdraw", async () => {
  //   const tx = await program.methods
  //     .withdraw()
  //     .accounts({donatePlatform, authority})
  //     .rpc()
  //   const data = await program.account.donates.fetch(donatePlatform);
  //   console.log(data)
  // });
});
