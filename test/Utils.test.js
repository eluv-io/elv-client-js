const Utils = require("../src/Utils");
const {ElvClient} = require("../src/ElvClient");
const {FrameClient} = require("../src/FrameClient");

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
});
