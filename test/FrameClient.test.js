const crypto = require("crypto");

Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
  },
});

const {FrameClient} = require("../src/FrameClient");
const OutputLogger = require("./utils/OutputLogger");
const {RandomBytes, CreateClient} = require("./utils/Utils");

let frameClient, client, libraryId, objectId, partHash;

const CompareMethods = (frameClientMethods, elvClientMethods) => {
  const differentKeys = frameClientMethods
    .filter(x => !elvClientMethods.includes(x))
    .concat(elvClientMethods.filter(x => !frameClientMethods.includes(x)));

  if(differentKeys.length > 0) {
    console.error("DIFFERING KEYS: ");
    console.error(differentKeys);

    console.error("EXPECTED");
    console.error(JSON.stringify(elvClientMethods.sort(), null, 2));

    throw Error("MISMATCHED ALLOWED METHODS BETWEEN ELV CLIENT AND FRAME CLIENT");
  }
};

describe("Test FrameClient", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);

    frameClient = OutputLogger(
      FrameClient,
      new FrameClient({target: window}),
      ["AwaitMessage"]
    );

    client = await CreateClient();

    window.addEventListener("message", async (event) => {
      if(!event || !event.data || event.data.type !== "ElvFrameRequest") { return; }

      const Respond = (response) => {
        response = {
          ...response,
          type: "ElvFrameResponse"
        };

        window.postMessage(
          response,
          "*"
        );
      };

      await client.CallFromFrameMessage(event.data, Respond);
    });
  });

  test("FrameClient methods match expected ElvClient methods", () => {
    CompareMethods(frameClient.AllowedMethods(), client.FrameAllowedMethods());
  });

  test("FrameClient methods match expected UserProfile methods", () => {
    CompareMethods(frameClient.AllowedUserProfileMethods(), client.userProfileClient.FrameAllowedMethods());
  });

  test("Call ElvClient Method", async () => {
    const result = (await client.ContentLibraries()).sort();
    const frameResult = (await frameClient.ContentLibraries()).sort();

    expect(frameResult).toBeDefined();
    expect(frameResult).toMatchObject(result);
  });

  test("Call ElvClient Method - Errors", async () => {
    console.error = jest.fn();

    try {
      await frameClient.ContentLibrary({libraryId: "ilib2GGnXjEAHoQZXNCpjzB8jjuguMQk"});
    } catch(e) {
      expect(e).toMatchObject({
        name: "ElvHttpClientError",
        method: "GET",
        status: 404,
      });

      expect(e.message).toBeDefined();
      expect(e.statusText).toBeDefined();
      expect(e.url).toBeDefined();
      expect(e.headers).toBeDefined();
      expect(e.headers.Authorization).toBeDefined();
    }
  });

  test("Get Account Address", async () => {
    const address = await frameClient.CurrentAccountAddress();

    expect(frameClient.utils.FormatAddress(address)).toEqual(frameClient.utils.FormatAddress(client.signer.address));
  });

  test("User Profile Methods", async () => {
    await expect(frameClient.userProfileClient.AccessLevel()).rejects.toThrow(
      new Error("'requestor' param required when calling user profile methods from FrameClient")
    );

    const accessLevel = await frameClient.userProfileClient.AccessLevel({requestor: "Test"});
    expect(accessLevel).toEqual("prompt");
  });

  test("Pass FrameClient Request", async () => {
    const Respond = jest.fn();

    const request = {
      calledMethod: "ContentLibraries",
      args: {},
      type: "ElvFrameRequest",
      requestId: 123,
      callbackId: undefined
    };

    const expectedResult = (await client.ContentLibraries()).sort();
    const result = await frameClient.PassRequest({
      request,
      Respond
    });

    expect(result).toBeDefined();

    result.response.sort();

    expect(result).toMatchObject({
      type: "ElvFrameResponse",
      requestId: 123,
      response: expectedResult
    });
  });

  test("Call ElvClient Method With Callback", async () => {
    libraryId = await frameClient.CreateContentLibrary({name: "test frame client"});
    const createResponse = await frameClient.CreateContentObject({libraryId});
    objectId = createResponse.id;

    const uploadResult = await frameClient.UploadPart({
      libraryId,
      objectId,
      writeToken: createResponse.write_token,
      data: RandomBytes(100000),
      chunkSize: 10000,
    });

    expect(uploadResult).toBeDefined();

    await frameClient.FinalizeContentObject({libraryId, objectId, writeToken: createResponse.write_token});

    partHash = uploadResult.part.hash;

    const callback = jest.fn();
    await frameClient.DownloadPart({
      libraryId,
      objectId,
      partHash,
      chunked: true,
      chunkSize: 10000,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(10);
  });

  test("Pass FrameClient Request With Callback", async () => {
    const callback = jest.fn();

    const request = {
      type: "ElvFrameRequest",
      requestId: 1234,
      calledMethod: "DownloadPart",
      args: {
        libraryId,
        objectId,
        partHash,
        chunked: true,
        chunkSize: 10000,
        callback
      },
      callbackId: 321
    };

    const result = await frameClient.PassRequest({
      request,
      Respond: callback
    });

    expect(result).toBeDefined();
    expect(result).toMatchObject({
      type: "ElvFrameResponse",
      requestId: 1234
    });
    expect(callback).toHaveBeenCalledTimes(10);
  });
});
