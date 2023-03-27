import algosdk from "algosdk";
import {
    indexerClient,
    marketplaceNote,
    algodClient,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts,
    minRound
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/pollSystem_approval.teal";
import clearProgram from "!!raw-loader!../contracts/pollSystem_clear.teal";
import {base64ToUTF8String, utf8ToBase64String} from "./conversions";

class Poll {
    constructor(owner, title, votingChoices, endTime, appId) {
        this.title = title;
        this.owner = owner;
        this.votingChoices = votingChoices;
        this.endTime = endTime;
        this.appId = appId
    }
}

export const getPolls = async () => {
    console.log("Fetching polls...");

    const address = "ITBD5TIB7DX5GKKBL4KRJH574ZVKUVQESBWZ6NOTNSLQBAD4Q2B7WSMNQY";
    let transactionInfo = await indexerClient.searchForTransactions({address}).address(address)
        .txType("appl")
        .minRound(minRound)
        .do()
        .catch((err) => {
            console.error(err);
        });

    console.log(transactionInfo);

    let polls = []
    for (const transaction of transactionInfo.transactions) {
        let appId = transaction["created-application-index"]
        if (appId) {
            await getApplication(appId).then((result)=>{
                if (result) {
                    polls.push(result)
                }
            }).catch(error => {
                console.log(error)
            })
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
    try{
        let params = await algodClient.getTransactionParams().do()
        params.fee = 1000;
        params.flatFee = true;

        console.log('ds')
        console.log(senderAddress)
        console.log(appId)

        let txn = algosdk.makeApplicationOptInTxn(senderAddress, params, appId);
        let txId = txn.txID().toString();

        let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
        console.log("Signed transaction with txID: %s", txId);
        console.log("creation")
        console.log(signedTxn)

        await algodClient.sendRawTransaction(signedTxn.blob).do()   
        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log("confirmed" + confirmedTxn)
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        
        const transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
        console.log("OptIn to app-id:", transactionResponse['txn']['txn']['apid']);
    } catch (error){
        alert('You have already opted in or the voting period has ended.')
    }
}

export const isOptedIn = async (senderAddress, appId) => {
    const accountInfo = await algodClient.accountInformation(senderAddress).do();
    const apps = accountInfo['apps-local-state'];
    const assetIDs = apps.map((asset) => asset['id']);
    return assetIDs.includes(appId);
  };

export const castVote = async (senderAddress, choice, appId) => {
    try {
    
        let vote = "vote"
        const appArgs = []
        appArgs.push(
        new Uint8Array(Buffer.from(vote)),
        new Uint8Array(Buffer.from(choice)),
        )

        console.log(vote)
        console.log(choice)
        let params = await algodClient.getTransactionParams().do()
        params.fee = 1000;
        params.flatFee = true;
        
        let txn = algosdk.makeApplicationNoOpTxn(senderAddress, params, appId, appArgs)

        let txId = txn.txID().toString();

        let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());

        await algodClient.sendRawTransaction(signedTxn.blob).do() 

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
        alert('Vote casted.')
    }catch(error){
        alert('You have not opted in, have already voted or the voting period has ended.')
    }
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

export const createNewPoll = async (senderAddress, pollTitle, pollOptions, duration) => {
    console.log("Adding poll...")
    console.log(duration)


    const voteEnd = Math.floor(duration.getTime() / 1000); // convert milliseconds to seconds
    console.log(voteEnd);

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    let note = new TextEncoder().encode(marketplaceNote);
    let title = new TextEncoder().encode(pollTitle);
    let options = new TextEncoder().encode(pollOptions);

    console.log(senderAddress)

    let appArgs = [title, options]

    appArgs.push(algosdk.encodeUint64(voteEnd))

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

        let owner = response.application.params.creator;

        const getField = (fieldName, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        // let title = base64ToUTF8String(response.application.params["global-state"].find(entry => entry.key === utf8ToBase64String("Title")).value.bytes);
        // let votingChoices = base64ToUTF8String(response.application.params["global-state"].find(entry => entry.key === utf8ToBase64String("VotingChoices")).value.bytes);
        // let endTime = base64ToUTF8String(response.application.params["global-state"].find(entry => entry.key === utf8ToBase64String("EndTime")).value.bytes);

        // console.log('ee')
        // console.log(title)
        // console.log(votingChoices)
        // console.log(endTime)

        let title =''
        let votingChoices=''
        let endTime=''

        if (getField("Title", globalState) !== undefined) {
            let field = getField("Title", globalState).value.bytes
            title = base64ToUTF8String(field)
        }

        if (getField("VotingChoices", globalState) !== undefined) {
            let field = getField("VotingChoices", globalState).value.bytes
            votingChoices = base64ToUTF8String(field)
        }


        if (getField("EndTime", globalState) !== undefined) {
            endTime = getField("EndTime", globalState).value.uint
        }

        return new Poll(owner, title, votingChoices, endTime, appId)
    } catch (err) {
        return null;
    }
}

export default Poll;