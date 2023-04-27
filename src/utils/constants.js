import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import * as paillierBigint from "paillier-bigint";

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

export let publicKey;
export let privateKey;

async function generateKeys() {
  if (!publicKey || !privateKey) {
    const keys = await paillierBigint.generateRandomKeys(50);
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  }
}

generateKeys().catch(console.error);
