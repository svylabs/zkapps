import { Mina, PublicKey, PrivateKey, fetchAccount } from 'o1js';
import { Add } from './Add.js';

const Network = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');

Mina.setActiveInstance(Network);

const appKey = PublicKey.fromBase58('B62qis1NZrC5ebHsKqH9BEBqAmYMuZHitnLGatzruPZpSrZ74DkgygG');

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


const accountPrivateKey = PrivateKey.fromBase58('EKFCLzva9NHiWpc3PqWoy8Gig9KV4PC2e8muiwjfEHPgyyYtiTgV');
const accountPublicKey = accountPrivateKey.toPublicKey();


console.log("Compiling...");
await Add.compile();

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
