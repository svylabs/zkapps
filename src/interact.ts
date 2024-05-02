// import { Mina, PrivateKey, PublicKey, fetchAccount } from 'snarkyjs';
import { Mina, PublicKey, PrivateKey, fetchAccount } from 'o1js';

import { Add } from './Add.js';

const Network = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');

Mina.setActiveInstance(Network);

const appKey = PublicKey.fromBase58('B62qis1NZrC5ebHsKqH9BEBqAmYMuZHitnLGatzruPZpSrZ74DkgygG');

const zkApp = new Add(appKey);
await fetchAccount({ publicKey: appKey});
console.log(zkApp.num.get().toString());
