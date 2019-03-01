const {FrameClient} = require("../src/FrameClient");
const {RandomBytes, CreateClient} = require("./utils/Utils");

let frameClient;
let client;

const CompareMethods = (frameClientMethods, elvClientMethods) => {
  const differentKeys = frameClientMethods
    .filter(x => !elvClientMethods.includes(x))
    .concat(elvClientMethods.filter(x => !frameClientMethods.includes(x)));

  if (differentKeys.length > 0) {
    console.log("DIFFERING KEYS: ");
    console.error(differentKeys);

    console.error("EXPECTED");
    console.error(JSON.stringify(elvClientMethods.sort(), null, 2));

    throw Error("MISMATCHED ALLOWED METHODS BETWEEN ELV CLIENT AND FRAME CLIENT");
  }
};

describe("Test FrameClient", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);

    frameClient = new FrameClient({target: window});

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
    CompareMethods(frameClient.AllowedUserProfileMethods(), client.userProfile.FrameAllowedMethods());
  });

  test("Call ElvClient Method", async () => {
    const result = await client.ContentLibraries();
    const frameResult = await frameClient.ContentLibraries();

    expect(frameResult).toBeDefined();
    expect(frameResult).toEqual(result);
  });

  test("Call ElvClient Method - Errors", async () => {
    console.error = jest.fn();

    await expect(frameClient.ContentLibrary({libraryId: "ilibabcd"}))
      .rejects.toMatchObject({status: 404});

    expect(console.error).toHaveBeenCalled();
  });


  test("Call ElvClient Method With Callback", async () => {
    const libraryId = await frameClient.CreateContentLibrary({name: "test frame client"});
    const createResponse = await frameClient.CreateContentObject({libraryId});

    const callback = jest.fn();

    await frameClient.UploadPart({
      libraryId,
      objectId: createResponse.id,
      writeToken: createResponse.write_token,
      data: RandomBytes(100000),
      chunkSize: 10000,
      callback
    });

    expect(callback).toHaveBeenCalledTimes(11);

    await frameClient.DeleteContentLibrary({libraryId});
  });

  test("Get Account Address", async () => {
    const address = await frameClient.CurrentAccountAddress();

    expect(frameClient.utils.FormatAddress(address)).toEqual(frameClient.utils.FormatAddress(client.signer.address));
  });


  test("User Profile Methods", async () => {
    await expect(frameClient.userProfile.AccessLevel()).rejects.toThrow(
      new Error("'requestor' param required when calling user profile methods from FrameClient")
    );

    const accessLevel = await frameClient.userProfile.AccessLevel({requestor: "Test"});
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

    const expectedResult = await client.ContentLibraries();
    const result = await frameClient.PassRequest({
      request,
      Respond
    });

    expect(result).toBeDefined();
    expect(result).toMatchObject({
      type: "ElvFrameResponse",
      requestId: 123,
      response: expectedResult
    });
  });

  test("Pass FrameClient Request With Callback", async () => {
    const libraryId = await client.CreateContentLibrary({name: "test frame client"});
    const createResponse = await client.CreateContentObject({libraryId});

    const callback = jest.fn();

    const request = {
      type: "ElvFrameRequest",
      requestId: 1234,
      calledMethod: "UploadPart",
      args: {
        libraryId,
        objectId: createResponse.id,
        writeToken: createResponse.write_token,
        data: RandomBytes(100000),
        chunkSize: 10000,
      },
      callbackId: 321
    };

    const result = await frameClient.PassRequest({
      request,
      Respond: callback
    });

    await client.DeleteContentLibrary({libraryId});

    expect(result).toBeDefined();
    expect(result).toMatchObject({
      type: "ElvFrameResponse",
      requestId: 1234
    });
    expect(callback).toHaveBeenCalledTimes(11);
    expect(callback).toHaveBeenCalledWith({
      type: "ElvFrameResponse",
      requestId: 321,
      response: {
        uploaded: 0,
        total: 100000
      }
    });
    expect(callback).toHaveBeenLastCalledWith({
      type: "ElvFrameResponse",
      requestId: 321,
      response: {
        uploaded: 100000,
        total: 100000
      }
    });
  });
});
