import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
// import * as paillierBigint from 'paillier-bigint'

const config = {
  algodToken: "",
  algodServer: "https://node.testnet.algoexplorerapi.io",
  algodPort: "",
  indexerToken: "",
  indexerServer: "https://testnet-idx.algonode.network",
  indexerPort: "",
};

export const algodClient = new algosdk.Algodv2(
  config.algodToken,
  config.algodServer,
  config.algodPort
);

export const indexerClient = new algosdk.Indexer(
  config.indexerToken,
  config.indexerServer,
  config.indexerPort
);

export const myAlgoConnect = new MyAlgoConnect();

// export let publicKey;
// export let privateKey;

// async function generateKeys() {
//     console.log('ppp')
//     if(!publicKey || !privateKey){
//         console.log('ppp1')
//         const keys = await paillierBigint.generateRandomKeys(50);
//         publicKey = keys.publicKey;
//         privateKey = keys.privateKey;
//     }
// }

// generateKeys().catch(console.error);

export const minRound = 29407900;

export const marketplaceNote = "polling-system:uv8";

export const numLocalInts = 4;
export const numLocalBytes = 4;

export const numGlobalInts = 6;
export const numGlobalBytes = 6;
