import algosdk from "algosdk";
import {
    indexerClient,
    marketplaceNote,
    minRound,
    algodClient,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/pollingSystem_approval.teal";
import clearProgram from "!!raw-loader!../contracts/pollingSystem_clear.teal";
import {base64ToUTF8String, utf8ToBase64String} from "./conversions";

class Poll {
    constructor(title, creator, options, voted) {
        this.title = title;
        this.creator = creator;
        this.options = options;
        this.voted = voted;
    }
}

export const getPolls = async () => {
    console.log("Fetching polls...")
    let note = new TextEncoder().encode(marketplaceNote);
    let encodedNote = Buffer.from(note).toString("base64");

    const address = "ITBD5TIB7DX5GKKBL4KRJH574ZVKUVQESBWZ6NOTNSLQBAD4Q2B7WSMNQY";
    let transactionInfo = await indexerClient.searchForTransactions({address}).address(address)
        .txType("appl")
        .do()
        .catch((err) => {
            console.error(err);
        });

    let polls = []
    console.log(transactionInfo.transactions);
    for (const transaction of transactionInfo.transactions) {
        let appId = transaction["created-application-index"]
        if (appId) {
            // Step 2: Get each application by application id
            let poll = await getApplication(appId)
            if (poll) {
                polls.push(poll)
            }
        }
    }
    console.log("Products fetched.")
    console.log(polls)
    return polls
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

export const castVote = async (senderAddress, poll, choice) => {
}

export const removePoll = async (senderAddress, index) => {
}

export const createNewPoll = async (senderAddress, pollTitle, pollOptions) => {
    console.log("Adding poll...")

    // let params = await algodClient.getTransactionParams().do();
    // params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    // params.flatFee = true;

    // const votedParam = 0;
    // let creatorParam= 'deni';

    // // Compile programs
    // const compiledApprovalProgram = await compileProgram(approvalProgram)
    // const compiledClearProgram = await compileProgram(clearProgram)

    // // Build note to identify transaction later and required app args as Uint8Arrays
    // let note = new TextEncoder().encode(marketplaceNote);
    // let title = new TextEncoder().encode(pollTitle);
    // let creator = new TextEncoder().encode(creatorParam);
    // let options = new TextEncoder().encode(pollOptions);
    // let voted = algosdk.encodeUint64(votedParam);

    // let appArgs = [title, creator, options, voted]

    // // Create ApplicationCreateTxn
    // let txn = algosdk.makeApplicationCreateTxnFromObject({
    //     from: senderAddress,
    //     suggestedParams: params,
    //     onComplete: algosdk.OnApplicationComplete.NoOpOC,
    //     approvalProgram: compiledApprovalProgram,
    //     clearProgram: compiledClearProgram,
    //     numLocalInts: numLocalInts,
    //     numLocalByteSlices: numLocalBytes,
    //     numGlobalInts: numGlobalInts,
    //     numGlobalByteSlices: numGlobalBytes,
    //     note: note,
    //     appArgs: appArgs
    // });

    // // Get transaction ID
    // let txId = txn.txID().toString();

    // // Sign & submit the transaction
    // let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    // console.log("Signed transaction with txID: %s", txId);
    // await algodClient.sendRawTransaction(signedTxn.blob).do();

    // // Wait for transaction to be confirmed
    // let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // // Get the completed Transaction
    // console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // // Get created application id and notify about completion
    // let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    // let appId = transactionResponse['application-index'];
    // console.log("Created new app-id: ", appId);
    // return appId;
}

const getApplication = async (appId) => {
    try {
        // 1. Get application by appId
        let response = await indexerClient.lookupApplications(appId).includeAll(true).do();
        if (response.application.deleted) {
            return null;
        }
        let globalState = response.application.params["global-state"]

        // 2. Parse fields of response and return product
        let owner = response.application.params.creator
        let title = ""
        let creator = ""
        let options = ""
        let voted = 0

        const getField = (fieldName, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        if (getField("TITLE", globalState) !== undefined) {
            let field = getField("TITLE", globalState).value.bytes
            title = base64ToUTF8String(field)
        }

        if (getField("CREATOR", globalState) !== undefined) {
            let field = getField("CREATOR", globalState).value.bytes
            creator = base64ToUTF8String(field)
        }

        if (getField("OPTIONS", globalState) !== undefined) {
            let field = getField("OPTIONS", globalState).value.bytes
            options = base64ToUTF8String(field)
        }

        if (getField("VOTED", globalState) !== undefined) {
            voted = getField("VOTED", globalState).value.uint
        }

        return new Poll(title, creator, options, voted, appId, owner)
    } catch (err) {
        return null;
    }
}