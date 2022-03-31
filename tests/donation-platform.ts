import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {DonationPlatform} from "../target/types/donation_platform";
import chai, {assert, expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const {SystemProgram} = anchor.web3;

describe("Let's test donation platform!", () => {
  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.DonationPlatform as Program<DonationPlatform>;
  const systemProgram = SystemProgram.programId;
  let owner = provider.wallet;
  let authority = owner.publicKey;

  async function find_donate_platform(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("donate_platform"), authority.toBuffer()], program.programId
    );
  }

  async function find_donator_acc(donatePlatform: anchor.web3.PublicKey, id: number) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("donate_platform_donator"), donatePlatform.toBuffer(), Buffer.from(id.toString())], program.programId
    );
  }

  async function get_lamports(to: anchor.web3.PublicKey) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(to, 20 * anchor.web3.LAMPORTS_PER_SOL),
      'confirmed'
    )
  }

  let donatorKeypair = anchor.web3.Keypair.generate();
  let donator = donatorKeypair.publicKey;

  before(async () => {
    await get_lamports(donator)

  })

  it("Program must throw error with target 0", async () => {
    let [donatePlatform,] = await find_donate_platform(authority);
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
    let [donatePlatform,] = await find_donate_platform(authority);
    const target = 10000;
    await program.methods
      .initialize(new anchor.BN(target))
      .accounts({
        donatePlatform,
        authority,
      })
      .rpc();

    let donates = await program.account.donates.fetch(donatePlatform);
    assert.equal(
      donates.target, target,
      "Targets are not the same!"
    );
    assert.deepEqual(
      donates.authority, authority,
      "Authorities are not the same!"
    )
    assert.equal(
      donates.collected, 0,
      "Collected amount is not zero!"
    )
  });

  it("User can send lamports", async () => {
    let donatorId = 1;
    let [donatePlatform,] = await find_donate_platform(authority);
    let [donatorAcc,] = await find_donator_acc(donatePlatform, donatorId);

    let lamportsBefore = await provider.connection.getBalance(donatePlatform);
    // let donatorAcc = await anchor.web3.Keypair.generate();
    let change = 5000;

    // await program.methods.
    await program.methods
      .send(new anchor.BN(donatorId), new anchor.BN(change))
      .accounts({
        donator,
        donatorAcc,
        donatePlatform,
      })
      .signers([donatorKeypair])
      .rpc()

    let lamportsAfter = await provider.connection.getBalance(donatePlatform);
    // assert.equal(
    //   lamportsAfter, lamportsBefore + change,
    //   "Unexpected amount of lamports after send!"
    // )

    let donates = await program.account.donates.fetch(donatePlatform);
    [donatorAcc,] = await find_donator_acc(donatePlatform, donatorId);

    let donatorAccData = await program.account.donator.fetch(donatorAcc);
    console.log(
      donates.reservedIds.toNumber(),
      donatorAccData.id.toNumber(),
      donatorAccData.address.toString(),
      donatorAccData.amount.toNumber(),
    )
    // assert.deepEqual(
    //   // @ts-ignore
    //   donates.donators.slice(-1)[0].address, donator,
    //   "The last donator is not ours!"
    // );
  });

  // it("User can't send 0 lamports", async () => {
  //   let [donatePlatform,] = await find_donate_platform(authority);
  //   expect((async () =>
  //       await program.methods
  //         .send(new anchor.BN(0))
  //         .accounts({
  //           donatePlatform,
  //           donator,
  //         })
  //         .signers([donatorKeypair])
  //         .rpc()
  //   )()).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  // });

  // it("Random user can't withdraw lamports", async () => {
  //   let [donatePlatform,] = await find_donate_platform(authority);
  //   expect((async () =>
  //       await program.methods
  //         .withdraw()
  //         .accounts({donatePlatform, authority: donator})
  //         .signers([donatorKeypair])
  //         .rpc()
  //   )()).to.be.rejectedWith(/A has one constraint was violated/);
  // })
  //
  // it("Authority can withdraw lamports", async () => {
  //   let [donatePlatform,] = await find_donate_platform(authority);
  //   let progBefore = await provider.connection.getBalance(donatePlatform);
  //   let authBefore = await provider.connection.getBalance(authority);
  //   let collected = (await program.account.donates.fetch(donatePlatform)).collected.toNumber();
  //
  //   await program.methods
  //     .withdraw()
  //     .accounts({donatePlatform, authority})
  //     .rpc()
  //
  //   let progAfter = await provider.connection.getBalance(donatePlatform);
  //   let authAfter = await provider.connection.getBalance(authority);
  //
  //   assert.equal(
  //     progBefore - progAfter - collected, authAfter - authBefore,
  //     "Difference between collected authority and doesn't match!"
  //   );
  // });
  //
  // it("Authority can't withdraw lamports if collected == 0", async () => {
  //   let [donatePlatform,] = await find_donate_platform(authority);
  //   expect((async () =>
  //       await program.methods
  //         .withdraw()
  //         .accounts({donatePlatform, authority})
  //         .rpc()
  //   )()).to.be.rejectedWith(/A has one constraint was violated/);
  // })
});
