const {ElvClient} = require("../src/ElvClient");
const {FrameClient} = require("../src/FrameClient");
const OutputLogger = require("./utils/OutputLogger");

let UtilsModule = require("../src/Utils");
const Utils = OutputLogger(UtilsModule, UtilsModule);
//const Utils = UtilsModule;

const {RandomBytes, RandomString} = require("./utils/Utils");

describe("Test Utils", () => {
  test("ElvClient Utils", () => {
    const client = new ElvClient({
      contentSpaceId: "ispc31pVYrPoMFqYZqPHdcgAFnwA3un",
      hostname: "localhost",
      port: 8008,
      ethHostname: "localhost",
      ethPort: 8545
    });

    expect(client.utils).toBeDefined();
  });

  test("FrameClient Utils", () => {
    const client = new FrameClient();

    expect(client.utils).toBeDefined();
  });

  test("Multipart Hash Handling", () => {
    const spaceId = "ispcZLusoJnHFwAX9pfFB2rYX2yLnsY";
    const libraryId = "ilibZLusoJnHFwAX9pfFB2rYX2yLnsY";
    const objectId = "iq__ZLusoJnHFwAX9pfFB2rYX2yLnsY";
    const address = "0x2806e87e50dd3d9873c8487573ea512c6861c0df";

    // Hash <-> Address
    expect(Utils.HashToAddress(spaceId)).toEqual(address);
    expect(Utils.HashToAddress(libraryId)).toEqual(address);
    expect(Utils.HashToAddress(objectId)).toEqual(address);
    expect(Utils.AddressToLibraryId(address)).toEqual(libraryId);

    // Space <-> Library
    expect(Utils.AddressToSpaceId(Utils.HashToAddress(libraryId))).toEqual(spaceId);
    expect(Utils.AddressToLibraryId(Utils.HashToAddress(spaceId))).toEqual(libraryId);

    // Space <-> Object
    expect(Utils.AddressToSpaceId(Utils.HashToAddress(objectId))).toEqual(spaceId);
    expect(Utils.AddressToObjectId(Utils.HashToAddress(spaceId))).toEqual(objectId);

    // Library <-> Object
    expect(Utils.AddressToObjectId(Utils.HashToAddress(libraryId))).toEqual(objectId);
    expect(Utils.AddressToLibraryId(Utils.HashToAddress(objectId))).toEqual(libraryId);

    // Hash Equality
    expect(Utils.EqualHash(spaceId, libraryId)).toBeTruthy();
    expect(Utils.EqualHash(libraryId, spaceId)).toBeTruthy();
    expect(Utils.EqualHash(spaceId, objectId)).toBeTruthy();
    expect(Utils.EqualHash(objectId, spaceId)).toBeTruthy();
    expect(Utils.EqualHash(libraryId, objectId)).toBeTruthy();
    expect(Utils.EqualHash(objectId, libraryId)).toBeTruthy();

    expect(Utils.EqualHash(objectId, "iq__3WDneTPchE1qG7w4rpTQWzCZnBTR")).toBeFalsy();
  });

  test("Bytes32 Conversion", () => {
    expect(Utils.ToBytes32("Hello World!")).toEqual("0x48656c6c6f20576f726c64210000000000000000000000000000000000000000");
  });

  test("Ether Conversion", () => {
    expect(Utils.weiPerEther.isEqualTo("1000000000000000000"));

    const ether = Utils.WeiToEther(Utils.weiPerEther);
    expect(ether.isEqualTo(1)).toBeTruthy();

    const wei = Utils.EtherToWei("1.0");
    expect(wei.isEqualTo(Utils.weiPerEther)).toBeTruthy();
  });

  test("Cloneable", async () => {
    const cloneable = {
      string: "value",
      number: 0.5,
      nested: {
        value: "something"
      },
      set: new Set([1, 2, "a", {a: "b"}]),
      map: new Map([[1, 2], ["a", "b"], ["obj", {a: "b"}]]),
      arrayBuffer: RandomBytes(20),
      blob: await new Response(RandomBytes(30)).blob()
    };

    expect(Utils.IsCloneable(cloneable)).toBeTruthy();
    expect(Utils.MakeClonable(cloneable)).toEqual(cloneable);
  });

  test("Not Cloneable", async () => {
    let notCloneable = {
      string: "value",
      number: 0.5,
      nested: {
        value: "something"
      },
      map: new Map([[1, 2], ["a", "b"], ["obj", {a: "b"}], ["fn", () => {}]]),
      set: new Set([1, 2, "a", {a: "b"}]),
      buffer: Buffer.from(RandomString(20)),
      arrayBuffer: RandomBytes(20),
      blob: await new Response(RandomBytes(30)).blob(),
      response: new Response(RandomBytes(30)),
      function: () => {},
      error: new Error("Error")
    };

    expect(Utils.IsCloneable(notCloneable)).toBeFalsy();

    const cloneable = Utils.MakeClonable(notCloneable);
    expect(notCloneable).not.toEqual(cloneable);

    // Remove / transform not cloneable things
    delete notCloneable.response;
    delete notCloneable.function;
    notCloneable.error = "Error";
    notCloneable.buffer = Utils.BufferToArrayBuffer(notCloneable.buffer);
    notCloneable.map.delete("fn");

    expect(notCloneable).toEqual(cloneable);
  });
});
