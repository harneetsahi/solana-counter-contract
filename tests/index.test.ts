import * as borsh from "borsh";
import { CounterAccount, schema } from "./types";
import { expect, test } from "bun:test";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { COUNTER_SIZE } from "./types";

let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();
let PROGRAM_ID = new PublicKey("7vCBU5JDMXF5scKHS1rsHwFM3HRakYeuebZyPJrHiPKn");
const connection = new Connection("http://127.0.0.1:8899");

test("Account initialized", async () => {
  // created a local admin acccount and stored some sol in it
  const transx = await connection.requestAirdrop(
    adminAccount.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(transx);
  const data = await connection.getAccountInfo(adminAccount.publicKey);

  // create data account and send sol to it
  const lamportsNeeded = await connection.getMinimumBalanceForRentExemption(
    COUNTER_SIZE
  );

  const instructions = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    lamports: lamportsNeeded,
    newAccountPubkey: dataAccount.publicKey,
    programId: PROGRAM_ID,
    space: COUNTER_SIZE,
  });

  const transxCreateDataAccount = new Transaction();

  transxCreateDataAccount.add(instructions);

  const signature = await connection.sendTransaction(transxCreateDataAccount, [
    adminAccount,
    dataAccount,
  ]);

  await connection.confirmTransaction(signature);

  // checking data account info
  const dataAccountInfo = await connection.getAccountInfo(
    dataAccount.publicKey
  );

  if (!dataAccountInfo) throw new Error("Data account not found");

  const count = borsh.deserialize(
    schema,
    dataAccountInfo.data
  ) as CounterAccount;

  expect(count.count).toBe(0);
});
