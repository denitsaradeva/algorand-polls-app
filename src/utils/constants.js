import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";

const config = {
    algodToken: "",
    algodServer: "https://node.testnet.algoexplorerapi.io",
    algodPort: "",
    indexerToken: "",
    indexerServer: "https://testnet-idx.algonode.network",
    indexerPort: "",
}

export const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

export const indexerClient = new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort);

export const myAlgoConnect = new MyAlgoConnect();

export const minRound = 28597900;

// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const marketplaceNote = "polling-system:uv8"

// Maximum local storage allocation, immutable
export const numLocalInts = 4;
export const numLocalBytes = 4;
// Maximum global storage allocation, immutable
export const numGlobalInts = 6; // Global variables stored as Int: count, sold
export const numGlobalBytes = 6; // Global variables stored as Bytes: name, description, image