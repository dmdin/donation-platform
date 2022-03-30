import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {DonationPlatform} from "../target/types/donation_platform";
import chai from "chai";
import {expect, assert} from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const {SystemProgram} = anchor.web3;

describe("Let's test donation platform!", () => {
  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.DonationPlatform as Program<DonationPlatform>;
  const systemProgram = SystemProgram.programId;
  // const donatePlatformKeypair = anchor.web3.Keypair.generate();
  // const donatePlatform = donatePlatformKeypair.publicKey;
  let owner = provider.wallet;
  let authority = owner.publicKey;

  async function find_program(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("donate_platform"), authority.toBuffer()], program.programId
    );
  }

  async function get_lamports(to: anchor.web3.Keypair | anchor.web3.PublicKey) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(donator, 2 * anchor.web3.LAMPORTS_PER_SOL),
      'confirmed'
    )
  }
  let donatorKeypair = anchor.web3.Keypair.generate();
  let donator = donatorKeypair.publicKey;

  before(async () => {
    await get_lamports(donator)

  })

  it("Program must throw error with target 0", async () => {
    let [donatePlatform, donatePlatformBump] = await find_program(authority);
    expect((async () =>
        await program.methods
          .initialize(new anchor.BN(0))
          .accounts({
            donatePlatform,
            authority,
            systemProgram,
          })
          .rpc()
    )()).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  });

  it("Program is initialized correctly", async () => {
    let [donatePlatform, donatePlatformBump] = await find_program(authority);

    let tx = await program.methods
      .initialize(new anchor.BN(1000))
      .accounts({
          donatePlatform,
          authority,
      })
      .rpc();

    let donates = await program.account.donates.fetch(donatePlatform);
    assert.equal(donates.target, 1000, "Targets are not the same!");
    assert.deepEqual(donates.authority, authority, "Authorities are not the same!")
    assert.equal(donates.collected, 0, "Collected amount is not zero!")
  });

  it("User can send lamports", async () => {
    let [donatePlatform, donatePlatformBump] = await find_program(authority);
    let lamportsBefore = await provider.connection.getBalance(donatePlatform);

    let tx = await program.methods
      .send(new anchor.BN(100))
      .accounts({
        donator,
        donatePlatform,
      })
      .signers([donatorKeypair])
      .rpc()
    let lamportsAfter = await provider.connection.getBalance(donatePlatform);
    assert.equal(lamportsAfter, lamportsBefore + 100, "Unexpected amount of lamports after send!")
  });

  it("User can't send 0 lamports", async () => {
    let [donatePlatform, donatePlatformBump] = await find_program(authority);
    expect((async () =>
        await program.methods
          .send(new anchor.BN(0))
          .accounts({
            donatePlatform,
            donator,
          })
          .signers([donatorKeypair])
          .rpc()
    )()).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  });

  // it("Withdraw", async () => {
  //   const tx = await program.methods
  //     .withdraw()
  //     .accounts({donatePlatform, authority})
  //     .rpc()
  //   const data = await program.account.donates.fetch(donatePlatform);
  //   console.log(data)
  // });
});
