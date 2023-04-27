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
  minRound,
  // publicKey,
  // privateKey
} from "../../utils/constants";
import approvalProgram from "!!raw-loader!../contracts/pollSystem_approval.teal";
import clearProgram from "!!raw-loader!../contracts/pollSystem_clear.teal";
import {
  base64ToUTF8String,
  utf8ToBase64String,
} from "../../utils/conversions";
import * as bigintConversion from "bigint-conversion";
import Poll, {
  getPolls,
  isOptedIn,
  castVote,
  retrieveVotes,
  toBytes,
  createNewPoll,
} from "../../utils/pollCentre";

jest.mock("algosdk");
jest.mock("./constants");
jest.mock("!!raw-loader!../contracts/pollSystem_approval.teal");
jest.mock("!!raw-loader!../contracts/pollSystem_clear.teal");
jest.mock("./conversions");
jest.mock("bigint-conversion");

describe("Poll", () => {
  let instance;

  beforeEach(() => {
    instance = new Poll();
  });

  it("instance should be an instanceof Poll", () => {
    expect(instance instanceof Poll).toBeTruthy();
  });
});

describe("getPolls", () => {
  it("should expose a function", () => {
    expect(getPolls).toBeDefined();
  });

  it("getPolls should return expected output", async () => {
    const retValue = await getPolls();
    expect(retValue).toBeTruthy();
  });
});
describe("isOptedIn", () => {
  it("should expose a function", () => {
    expect(isOptedIn).toBeDefined();
  });

  it("isOptedIn should return expected output", async () => {
    const retValue = await isOptedIn(senderAddress, appId);
    expect(retValue).toBeTruthy();
  });
});
describe("castVote", () => {
  it("should expose a function", () => {
    expect(castVote).toBeDefined();
  });

  it("castVote should return expected output", async () => {
    retValue = await castVote(senderAddress, choice, appId);
    expect(retValue).toBeTruthy();
  });
});
describe("retrieveVotes", () => {
  it("should expose a function", () => {
    expect(retrieveVotes).toBeDefined();
  });

  it("retrieveVotes should return expected output", async () => {
    retValue = await retrieveVotes(appID);
    expect(retValue).toBeTruthy();
  });
});
describe("toBytes", () => {
  it("should expose a function", () => {
    expect(toBytes).toBeDefined();
  });

  it("toBytes should return expected output", () => {
    retValue = toBytes(input);
    expect(retValue).toBeTruthy();
  });
});
describe("createNewPoll", () => {
  it("should expose a function", () => {
    expect(createNewPoll).toBeDefined();
  });

  it("createNewPoll should return expected output", async () => {
    retValue = await createNewPoll(
      senderAddress,
      pollTitle,
      pollOptions,
      duration
    );
    expect(retValue).toBeTruthy();
  });
});
