/*global AlgoSigner*/
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

const userAccount =  algosdk.mnemonicToSecretKey("yellow find peace lion quote phrase web lend horn cloud erupt cage kidney chunk curtain crisp film argue chunk stock crater mask entry above mosquito")

export const getPolls = async () => {
    console.log("Fetching polls...");
    let note = new TextEncoder().encode(marketplaceNote);

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

const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

export const Optin = async (senderAddress, appId) => {
 
    let params = await algodClient.getTransactionParams().do()
    params.fee = 1000;
    params.flatFee = true;

    let txn = algosdk.makeApplicationOptInTxn(senderAddress, params, appId);
    let txId = txn.txID().toString();
    let signedTxn = txn.signTxn(userAccount.sk);
    console.log("Signed transaction with txID: %s", txId);

    await algodClient.sendRawTransaction(signedTxn).do()   
       const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log("confirmed" + confirmedTxn)
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
      
        const transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
        console.log("OptIn to app-id:", transactionResponse['txn']['txn']['apid']);
}

export const castVote = async (senderAddress, choice, appId) => {
    
      let vote = "vote"
      const appArgs = []
      appArgs.push(
        new Uint8Array(Buffer.from(vote)),
        new Uint8Array(Buffer.from(choice)),
       )
      let params = await algodClient.getTransactionParams().do()
      
      let txn = algosdk.makeApplicationNoOpTxn(senderAddress, params, appId, appArgs)

      let txId = txn.txID().toString();
       
        let signedTxn = txn.signTxn(userAccount.sk);
        console.log("Signed transaction with txID: %s", txId);
    
        await algodClient.sendRawTransaction(signedTxn).do() 

        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log("confirmed" + confirmedTxn)
    
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    
      let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
      console.log("Called app-id:",transactionResponse['txn']['txn']['apid']);
      if (transactionResponse['global-state-delta'] !== undefined ) {
          console.log("Global State updated:",transactionResponse['global-state-delta']);
      }
      if (transactionResponse['local-state-delta'] !== undefined ) {
          console.log("Local State updated:",transactionResponse['local-state-delta']);
      }
}

export const retrieveEndTime = async (appID) => {
    console.log(appID)
    let globalState = {}
    try {
        globalState = await algodClient.getApplicationByID(appID).do();
        console.log(globalState);
      } catch (error) {
        console.error(error);
      }
      
    let endTime = 0;
    for (const entry of globalState['params']['global-state']) {
        const key = base64ToUTF8String(entry['key']);
        const value = entry['value']['uint'];
        console.log('keyy')
        console.log(key)
        console.log('valuee')
        console.log(value)
        if (key === 'EndVoting') {
            endTime = value;
        }
    }

    console.log('end time')
    console.log(endTime)

    return endTime;
}

export const retrieveVotes = async (appID) => {
    console.log(appID)
    let globalState = {}
    try {
        globalState = await algodClient.getApplicationByID(appID).do();
        console.log(globalState);
      } catch (error) {
        console.error(error);
      }
      
    const voteCounts = {};
    for (const entry of globalState['params']['global-state']) {
        const key = base64ToUTF8String(entry['key']);
        const value = entry['value']['uint'];
        console.log('keyy')
        console.log(key)
        console.log('valuee')
        console.log(value)
        if (key !== 'TITLE' && key !== 'CREATOR' && key !== 'CHOICE' && key !== 'OPTIONS') {
            voteCounts[key] = parseInt(value);
        }
    }

    return voteCounts;
}

export const toBytes = (input) => {
    return input.toString()
}

export const createNewPoll = async (senderAddress, pollTitle, pollOptions) => {
    console.log("Adding poll...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    let note = new TextEncoder().encode(marketplaceNote);
    let title = new TextEncoder().encode(pollTitle);
    let options = new TextEncoder().encode(pollOptions);

    let currentRound = await algodClient.status().do()
    console.log(currentRound)
    console.log("ee1e")
    let lastRound = currentRound['last-round'];
    let VoteBegin = lastRound % 100000000;
    let VoteEnd = (VoteBegin + 200);

    console.log(VoteBegin)
    console.log(VoteEnd)

    let appArgs = [title, options]

    appArgs.push(algosdk.encodeUint64(VoteBegin))
    appArgs.push(algosdk.encodeUint64(VoteEnd))

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

    let txId = txn.txID().toString();

    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    console.log("creation")
    console.log(signedTxn)
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

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

        return new Poll(owner, title, options, appId)
    } catch (err) {
        return null;
    }
}