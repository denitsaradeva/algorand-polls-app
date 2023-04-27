import algosdk from "algosdk";
import {
  indexerClient,
  algodClient,
  myAlgoConnect,
  publicKey,
  privateKey,
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/pollSystem_approval.teal";
import clearProgram from "!!raw-loader!../contracts/pollSystem_clear.teal";
import * as bigintConversion from "bigint-conversion";

class Poll {
  constructor(owner, title, votingChoices, endTime, appId) {
    this.title = title;
    this.owner = owner;
    this.votingChoices = votingChoices;
    this.endTime = endTime;
    this.appId = appId;
  }
}

const base64ToUTF8String = (input) => {
  try {
    return Buffer.from(input, "base64").toString("utf-8");
  } catch (error) {
    console.log(error);
  }
};

const utf8ToBase64String = (input) => {
  try {
    return Buffer.from(input, "utf8").toString("base64");
  } catch (error) {
    console.log(error);
  }
};

export const getPolls = async () => {
  const address = "ITBD5TIB7DX5GKKBL4KRJH574ZVKUVQESBWZ6NOTNSLQBAD4Q2B7WSMNQY";
  let transactionInfo = await indexerClient
    .searchForTransactions({ address })
    .address(address)
    .txType("appl")
    .minRound(29407900)
    .do()
    .catch((err) => {
      console.error(err);
    });

  let polls = [];
  for (const transaction of transactionInfo.transactions) {
    let appId = transaction["created-application-index"];
    if (appId) {
      await getApplication(appId)
        .then((result) => {
          if (result) {
            polls.push(result);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  return polls;
};

const compileProgram = async (programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
};

export const isOptedIn = async (senderAddress, appId) => {
  const accountInfo = await algodClient.accountInformation(senderAddress).do();
  const apps = accountInfo["apps-local-state"];
  const assetIDs = apps.map((asset) => asset["id"]);
  return assetIDs.includes(appId);
};

export const castVote = async (senderAddress, choice, appId) => {
  try {
    const myChoice = bigintConversion.textToBigint(choice);
    const choiceParam = publicKey.encrypt(myChoice);

    let vote = "vote";
    const appArgs = [];
    appArgs.push(
      new Uint8Array(Buffer.from(vote)),
      new Uint8Array(Buffer.from(choice))
    );

    let params = await algodClient.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    let txn2 = algosdk.makeApplicationNoOpTxn(
      senderAddress,
      params,
      appId,
      appArgs
    );

    let txn1 = algosdk.makeApplicationOptInTxn(senderAddress, params, appId);

    const txnsArray = [txn1, txn2];
    const groupID = algosdk.computeGroupID(txnsArray);

    for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );

    let txId1 = txn1.txID().toString();
    let txId2 = txn2.txID().toString();

    await algodClient
      .sendRawTransaction([signedTxns[0].blob, signedTxns[1].blob])
      .do()
      .then(async () => {
        await algosdk.waitForConfirmation(algodClient, txId1, 4);
        await algosdk.waitForConfirmation(algodClient, txId2, 4);
        alert("Vote casted.");
      });
  } catch (error) {
    console.log(error);
    alert("You have already voted or the voting period has ended.");
  }
};

export const retrieveVotes = async (appID) => {
  let globalState = {};
  try {
    globalState = await algodClient.getApplicationByID(appID).do();
  } catch (error) {
    console.error(error);
  }
  const voteCounts = {};
  for (const entry of globalState["params"]["global-state"]) {
    const key = base64ToUTF8String(entry["key"]);
    const value = entry["value"]["uint"];
    if (
      key !== "Creator" &&
      key !== "EndTime" &&
      key !== "VotingChoices" &&
      key !== "Title"
    ) {
      const decrRes = privateKey.decrypt(bigintConversion.textToBigint(key));
      const keyN = bigintConversion.bigintToText(decrRes);
      voteCounts[key] = parseInt(value);
    }
  }

  return voteCounts;
};

export const toBytes = (input) => {
  return input.toString();
};

export const createNewPoll = async (
  senderAddress,
  pollTitle,
  pollOptions,
  duration
) => {
  try {
    const voteEnd = Math.floor(duration.getTime() / 1000);

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    const compiledApprovalProgram = await compileProgram(approvalProgram);
    const compiledClearProgram = await compileProgram(clearProgram);

    let noteArg = new TextEncoder().encode("polling-system");
    let title = new TextEncoder().encode(pollTitle);
    let options = new TextEncoder().encode(pollOptions);

    let appArgs = [title, options];

    appArgs.push(algosdk.encodeUint64(voteEnd));

    let txn = algosdk.makeApplicationCreateTxnFromObject({
      from: senderAddress,
      suggestedParams: params,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: compiledApprovalProgram,
      clearProgram: compiledClearProgram,
      numLocalInts: 4,
      numLocalByteSlices: 4,
      numGlobalInts: 6,
      numGlobalByteSlices: 6,
      note: noteArg,
      appArgs: appArgs,
    });

    let txId = txn.txID().toString();

    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    await algosdk.waitForConfirmation(algodClient, txId, 4);

    let transactionResponse = await algodClient
      .pendingTransactionInformation(txId)
      .do();
    let appId = transactionResponse["application-index"];
    alert("Poll created successfully!");
    return appId;
  } catch (error) {
    alert("An input field is invalid");
  }
};

const getApplication = async (appId) => {
  try {
    let response = await indexerClient
      .lookupApplications(appId)
      .includeAll(true)
      .do();
    if (response.application.deleted) {
      return null;
    }
    let globalState = response.application.params["global-state"];

    let owner = response.application.params.creator;

    let title = base64ToUTF8String(
      globalState.find((entry) => entry.key === utf8ToBase64String("Title"))
        .value.bytes
    );

    let votingChoices = base64ToUTF8String(
      globalState.find(
        (entry) => entry.key === utf8ToBase64String("VotingChoices")
      ).value.bytes
    );

    let endTime = globalState.find(
      (entry) => entry.key === utf8ToBase64String("EndTime")
    ).value.uint;

    return new Poll(owner, title, votingChoices, endTime, appId);
  } catch (err) {
    return null;
  }
};

export default Poll;
