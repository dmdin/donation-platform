import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { DonationPlatform } from "../target/types/donation_platform";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const { SystemProgram } = anchor.web3;

describe("Let's test donation platform!", () => {
  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.DonationPlatform as Program<DonationPlatform>;
  const donatesData = program.account.donates;
  const donatorData = program.account.donator;
  const topDonsData = program.account.topDonators;

  const systemProgram = SystemProgram.programId;
  let owner = provider.wallet;
  let authority = owner.publicKey;


  async function find_donate_platform(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("donate_platform"), authority.toBuffer()], program.programId
    );
  }

  async function find_top_donators(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("top_donators"), authority.toBuffer()], program.programId
    );
  }

  // New method based on account
  async function getTop10(authority: anchor.web3.PublicKey) {
    let [topDonators] = await find_top_donators(authority);
    let data = await topDonsData.fetch(topDonators);
    let top = data.donators;
    top.sort((a, b) => b.amount - a.amount);
    return top;
  }

  async function find_donator_acc(donatePlatform: anchor.web3.PublicKey, id: number) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("donate_platform_donator"), donatePlatform.toBuffer(), Buffer.from(id.toString())], program.programId
    );
  }

  async function get_lamports(to: anchor.web3.PublicKey) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(to, 20 * anchor.web3.LAMPORTS_PER_SOL),
      "confirmed"
    );
  }

  async function get_balance(address: anchor.web3.PublicKey) {
    return await provider.connection.getBalance(address);
  }

  let donatorKeypair = anchor.web3.Keypair.generate();
  let donator = donatorKeypair.publicKey;

  before(async () => {
    await get_lamports(donator);
  });

  it("Program must throw error with target 0", async () => {
    let [donatePlatform] = await find_donate_platform(authority);
    expect((async () =>
        await program.methods
          .initialize(new anchor.BN(0))
          .accounts({
            donatePlatform,
            authority,
            systemProgram
          })
          .rpc()
    )()).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  });

  it("Program is initialized correctly", async () => {
    let [donatePlatform] = await find_donate_platform(authority);
    let [topDonators] = await find_top_donators(authority);

    const target = 10000;
    await program.methods
      .initialize(new anchor.BN(target))
      .accounts({
        donatePlatform,
        authority,
        topDonators
      })
      .rpc();

    let donates = await donatesData.fetch(donatePlatform);
    assert.equal(
      donates.target, target,
      "Targets are not the same!"
    );
    assert.deepEqual(
      donates.authority, authority,
      "Authorities are not the same!"
    );
    assert.equal(
      donates.collected, 0,
      "Collected amount is not zero!"
    );
  });

  it("User ID=0 can send lamports", async () => {
    let donatorId = 0;
    let [donatePlatform] = await find_donate_platform(authority);
    let [topDonators] = await find_top_donators(authority);

    let [donatorAcc] = await find_donator_acc(donatePlatform, donatorId);

    let lamportsBefore = await get_balance(donatePlatform);
    let change = 5000;

    await program.methods
      .send(new anchor.BN(donatorId), new anchor.BN(change))
      .accounts({
        donator,
        donatorAcc,
        donatePlatform,
        topDonators
      })
      .signers([donatorKeypair])
      .rpc();

    let lamportsAfter = await get_balance(donatePlatform);
    assert.equal(
      lamportsAfter, lamportsBefore + change,
      "Unexpected amount of lamports after send!"
    );

    let donates = await donatesData.fetch(donatePlatform);
    [donatorAcc] = await find_donator_acc(donatePlatform, donatorId);
    let dnData = await donatorData.fetch(donatorAcc);

    assert.deepEqual(
      dnData.address, donator,
      "The last donator is not ours!"
    );
    assert.equal(
      dnData.amount, change,
      "Amount of donations is different!"
    );
  });

  it("User ID=0 can't send 0 lamports", async () => {
    let donatorId = 0;
    let [donatePlatform] = await find_donate_platform(authority);
    let [donatorAcc] = await find_donator_acc(donatePlatform, donatorId);

    expect((async () =>
        await program.methods
          .send(new anchor.BN(donatorId), new anchor.BN(0))
          .accounts({
            donator,
            donatorAcc,
            donatePlatform
          })
          .signers([donatorKeypair])
          .rpc()
    )()).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  });

  it("Random user can't withdraw lamports", async () => {
    let [donatePlatform] = await find_donate_platform(authority);
    expect((async () =>
        await program.methods
          .withdraw()
          .accounts({
            donatePlatform,
            authority: donator
          })
          .signers([donatorKeypair])
          .rpc()
    )()).to.be.rejectedWith(/A has one constraint was violated/);
  });

  it("Authority can withdraw lamports", async () => {
    let [donatePlatform] = await find_donate_platform(authority);
    let progBefore = await get_balance(donatePlatform);
    let authBefore = await get_balance(authority);
    let collected = (await program.account.donates.fetch(donatePlatform)).collected.toNumber();

    await program.methods
      .withdraw()
      .accounts({
        donatePlatform,
        authority
      })
      .rpc();

    let progAfter = await get_balance(donatePlatform);
    let authAfter = await get_balance(authority);

    assert.equal(
      progBefore - progAfter - collected, authAfter - authBefore,
      "Difference between collected authority and doesn't match!"
    );
  });

  it("Authority can't withdraw lamports if collected == 0", async () => {
    let [donatePlatform] = await find_donate_platform(authority);
    expect((async () =>
        await program.methods
          .withdraw()
          .accounts({
            donatePlatform,
            authority
          })
          .rpc()
    )()).to.be.rejectedWith(/A has one constraint was violated/);
  });

  it("ID increment works 1 time for old user", async () => {
    let newId = 1;
    let [donatePlatform] = await find_donate_platform(authority);
    let [topDonators] = await find_top_donators(authority);
    let [donatorAcc] = await find_donator_acc(donatePlatform, newId);

    await program.methods
      .send(new anchor.BN(newId), new anchor.BN(100))
      .accounts({
        donator,
        donatorAcc,
        donatePlatform,
        topDonators
      })
      .signers([donatorKeypair])
      .rpc();
    let dnData = await donatorData.fetch(donatorAcc);
    let ptData = await donatesData.fetch(donatePlatform);

    assert.equal(
      ptData.idCounter, newId + 1,
      "ID counter doesn't match!"
    );
  });

  it("ID increment works 2 time for new user", async () => {
    let newId = 2;
    let [donatePlatform] = await find_donate_platform(authority);
    let [topDonators] = await find_top_donators(authority);
    let [donatorAcc] = await find_donator_acc(donatePlatform, newId);

    let donatorKeypair = anchor.web3.Keypair.generate();
    let donator = donatorKeypair.publicKey;
    await get_lamports(donator);

    await program.methods
      .send(new anchor.BN(newId), new anchor.BN(77))
      .accounts({
        donator,
        donatorAcc,
        donatePlatform,
        topDonators
      })
      .signers([donatorKeypair])
      .rpc();

    let dnData = await donatorData.fetch(donatorAcc);
    let ptData = await donatesData.fetch(donatePlatform);

    assert.equal(
      ptData.idCounter, newId + 1,
      "ID counter doesn't match!"
    );
    assert.deepEqual(
      dnData.address, donator,
      "Addresses doesn't match!"
    );
  });

  it("Shouldn't work because newId is more than ID counter", async () => {
    let newId = 10;
    let [donatePlatform] = await find_donate_platform(authority);
    let [topDonators] = await find_top_donators(authority);
    let [donatorAcc] = await find_donator_acc(donatePlatform, newId);

    expect((async () =>
        await program.methods
          .send(new anchor.BN(newId), new anchor.BN(10))
          .accounts({
            donator,
            donatorAcc,
            donatePlatform,
            topDonators
          })
          .signers([donatorKeypair])
          .rpc()
    )()).to.be.rejectedWith(/Error Message: Passed ID is bigger than current ID counter/);
  });

  it("Send process works for new donator and owner", async () => {
    let owner = web3.Keypair.generate();
    let donator = web3.Keypair.generate();
    await Promise.all([
      get_lamports(owner.publicKey), get_lamports(donator.publicKey)
    ]);

    let [donatePlatform] = await find_donate_platform(owner.publicKey);
    let [topDonators] = await find_top_donators(owner.publicKey);

    await program.methods
      .initialize(new anchor.BN(1000))
      .accounts({
        donatePlatform,
        authority: owner.publicKey,
        topDonators
      })
      .signers([owner])
      .rpc();

    let [donatorAcc] = await find_donator_acc(donatePlatform, 0);
    let lamportsBefore = await get_balance(donatePlatform);
    let change = 100;

    await program.methods
      .send(new anchor.BN(0), new anchor.BN(change))
      .accounts({
        donator: donator.publicKey,
        donatorAcc,
        donatePlatform,
        topDonators
      })
      .signers([donator])
      .rpc();

    let lamportsAfter = await get_balance(donatePlatform);
    assert.equal(
      lamportsAfter, lamportsBefore + change,
      "Unexpected amount of lamports after send!"
    );
  });

  it("Saves top donaters in list", async () => {
    let top = await getTop10(authority);
    assert.equal(
      top[0].amount, 100,
      "Top 1 donator amount must be 100"
    );
    assert.equal(
      top[1].amount, 77,
      "Top 2 donator amount must be 77"
    );
  });
});
