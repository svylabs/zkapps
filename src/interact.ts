import { Mina, PublicKey, PrivateKey, fetchAccount } from 'o1js';
import { Add } from './Add.js';

const Network = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');

Mina.setActiveInstance(Network);

// const appKey = PublicKey.fromBase58('B62qpT321XRKMZrhGMPVP68Qbfk8eFhRMYBRb8GQjAPCKasHa2Pop9Y');
const appKey = PublicKey.fromBase58('B62qmLjV3pesTeM2L2HsyCCMGxvTznmFvkqD8c8PR1XxjQso6e1LoXS');

const zkApp = new Add(appKey);

try {
  const fetchedAccount = await fetchAccount({ publicKey: appKey });
  
  if (fetchedAccount && 'account' in fetchedAccount && fetchedAccount.account && fetchedAccount.account.publicKey) {
    
    console.log("Account details fetched successfully:", fetchedAccount.account);
  } else {
    console.error("Failed to fetch account details or account publicKey is missing.");
   }
} catch (error) {
  console.error("Error fetching account details:", error);
  }


const accountPrivateKey = PrivateKey.fromBase58('B62qmLjV3pesTeM2L2HsyCCMGxvTznmFvkqD8c8PR1XxjQso6e1LoXS');
const accountPublicKey = accountPrivateKey.toPublicKey();


console.log("Compiling...");
await Add.compile();

console.log("accountPrivateKey:- " + accountPrivateKey , "accountPublicKey:- " + accountPublicKey )

try {
  const tx = await Mina.transaction(
    { sender: accountPublicKey, fee: 0.1e9 },
    async () => {
      await zkApp.update();
    }
  );


  console.log("Proving...");
  await tx.prove();

  console.log("Sending transaction...");
  const sentTx = await tx.sign([accountPrivateKey]).send();

  console.log('Transaction hash:', sentTx.hash);
  console.log('View transaction on Mina Explorer:', 'https://berkeley.minaexplorer.com/transaction/' + sentTx.hash);
} catch (error) {
  console.error("Error during transaction:", error);
}


// /**
//  * This script can be used to interact with the Add contract, after deploying it.
//  *
//  * We call the update() method on the contract, create a proof and send it to the chain.
//  * The endpoint that we interact with is read from your config.json.
//  *
//  * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens
//  * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet
//  * would send the transaction and pay the fee.
//  *
//  * To run locally:
//  * Build the project: `$ npm run build`
//  * Run with node:     `$ node build/src/interact.js <deployAlias>`.
//  */
// import fs from 'fs/promises';
// import { Mina, NetworkId, PrivateKey } from 'o1js';
// import { Add } from './Add.js';

// // check command line arg
// let deployAlias = process.argv[2];
// if (!deployAlias)
//   throw Error(`Missing <deployAlias> argument.

// Usage:
// node build/src/interact.js <deployAlias>
// `);
// Error.stackTraceLimit = 1000;
// const DEFAULT_NETWORK_ID = 'testnet';

// // parse config and private key from file
// type Config = {
//   deployAliases: Record<
//     string,
//     {
//       networkId?: string;
//       url: string;
//       keyPath: string;
//       fee: string;
//       feepayerKeyPath: string;
//       feepayerAlias: string;
//     }
//   >;
// };
// let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
// let config = configJson.deployAliases[deployAlias];
// let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.feepayerKeyPath, 'utf8')
// );

// let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.keyPath, 'utf8')
// );

// let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
// let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// // set up Mina instance and contract we interact with
// const Network = Mina.Network({
//   // We need to default to the testnet networkId if none is specified for this deploy alias in config.json
//   // This is to ensure the backward compatibility.
//   networkId: (config.networkId ?? DEFAULT_NETWORK_ID) as NetworkId,
//   mina: config.url,
// });
// // const Network = Mina.Network(config.url);
// const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
// Mina.setActiveInstance(Network);
// let feepayerAddress = feepayerKey.toPublicKey();
// let zkAppAddress = zkAppKey.toPublicKey();
// let zkApp = new Add(zkAppAddress);

// // compile the contract to create prover keys
// console.log('compile the contract...');
// await Add.compile();

// try {
//   // call update() and send transaction
//   console.log('build transaction and create proof...');
//   let tx = await Mina.transaction(
//     { sender: feepayerAddress, fee },
//     async () => {
//       await zkApp.update();
//     }
//   );
//   await tx.prove();

//   console.log('send transaction...');
//   const sentTx = await tx.sign([feepayerKey]).send();
//   if (sentTx.status === 'pending') {
//     console.log(
//       '\nSuccess! Update transaction sent.\n' +
//         '\nYour smart contract state will be updated' +
//         '\nas soon as the transaction is included in a block:' +
//         `\n${getTxnUrl(config.url, sentTx.hash)}`
//     );
//   }
// } catch (err) {
//   console.log(err);
// }

// function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
//   const txnBroadcastServiceName = new URL(graphQlUrl).hostname
//     .split('.')
//     .filter((item) => item === 'minascan' || item === 'minaexplorer')?.[0];
//   const networkName = new URL(graphQlUrl).hostname
//     .split('.')
//     .filter(
//       (item) => item === 'berkeley' || item === 'testworld' || item === 'devnet'
//     )?.[0];
//   if (txnBroadcastServiceName && networkName) {
//     return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
//   }
//   return `Transaction hash: ${txnHash}`;
// }

