import algosdk from "algosdk";
import {
    indexerClient,
    marketplaceNote,
    algodClient,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/pollSystem_approval.teal";
import clearProgram from "!!raw-loader!../contracts/pollSystem_clear.teal";
import {base64ToUTF8String, utf8ToBase64String} from "./conversions";

class Poll {
    constructor(owner, title, options, appId) {
        this.title = title;
        this.owner = owner;
        this.options = options;
        this.appId = appId
    }
}

export const getPolls = async () => {
    console.log("Fetching polls...");
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

// export const getAppIdByTitle = async (title) => {
//     const limit = 1;
//     const response = await indexerClient.searchForApplications()
//       .limit(limit)
//       .nextToken("")
//       .applicationName(title)
//       .do();
  
//     const app = response.applications[0];
//     if (!app) {
//       console.log(`Application with title ${title} not found`);
//       return null;
//     }
  
//     return app.id;
//   }

export const castVote = async (senderAddress, choice, appId) => {
    const note = new Uint8Array(Buffer.from('polling-system:uv4'));
    // const vote = Buffer.from('vote').toString('hex');
    // const choiceEnc = Buffer.from(choice).toString('hex');
    let vote = new TextEncoder().encode('vote');
    let choiceEnc = new TextEncoder().encode(choice);

    const params = await algodClient.getTransactionParams().do();
    const onVoteTxn = algosdk.makeApplicationNoOpTxn(
        senderAddress,
        params,
        appId,
        [algosdk.encodeUint64(0), vote, choiceEnc]
    );

    let txId = onVoteTxn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(onVoteTxn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

}

// export const removePoll = async (senderAddress, index) => {
// }

export const createNewPoll = async (senderAddress, pollTitle, pollOptions) => {
    console.log("Adding poll...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    // Build note to identify transaction later and required app args as Uint8Arrays
    let note = new TextEncoder().encode(marketplaceNote);
    let title = new TextEncoder().encode(pollTitle);
    let options = new TextEncoder().encode(pollOptions);

    let appArgs = [title, options]

    // Create ApplicationCreateTxn
    let txn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
        note: note,
        appArgs: appArgs
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get created application id and notify about completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index'];
    console.log("Created new app-id: ", appId);
    return appId;
}

const getApplication = async (appId) => {
    try {
        let response = await indexerClient.lookupApplications(appId).includeAll(true).do();
        if (response.application.deleted) {
            return null;
        }
        let globalState = response.application.params["global-state"]

        let owner = response.application.params.creator
        let title = ""
        let options = ""

        const getField = (fieldName, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        if (getField("TITLE", globalState) !== undefined) {
            let field = getField("TITLE", globalState).value.bytes
            title = base64ToUTF8String(field)
        }

        if (getField("OPTIONS", globalState) !== undefined) {
            let field = getField("OPTIONS", globalState).value.bytes
            options = base64ToUTF8String(field)
        }

        if (getField("OPTIONS", globalState) !== undefined) {
            let field = getField("OPTIONS", globalState).value.bytes
            options = base64ToUTF8String(field)
        }

        return new Poll(owner, title, options, appId)
    } catch (err) {
        return null;
    }
}