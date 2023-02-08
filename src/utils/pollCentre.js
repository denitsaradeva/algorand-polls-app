import algosdk from "algosdk";
import {
    indexerClient,
    marketplaceNote,
    minRound
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
// import approvalProgram from "!!raw-loader!../contracts/pollingSystem_approval.teal";
// import clearProgram from "!!raw-loader!../contracts/pollingSystem_clear.teal";
import {base64ToUTF8String, utf8ToBase64String} from "./conversions";

class Product {
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

        return new Product(title, creator, options, voted, appId, owner)
    } catch (err) {
        return null;
    }
}