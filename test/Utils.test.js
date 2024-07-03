const {Initialize,SetNodes} = require("./utils/Utils");
const OutputLogger = require("./utils/OutputLogger");
const {
  describe,
  expect,
  runTests,
  test
} = Initialize();

const {ElvClient} = require("../src/ElvClient");
const {FrameClient} = require("../src/FrameClient");

const Utils = OutputLogger(require("../src/Utils"), require("../src/Utils"));
const URI = require("urijs");

const {RandomBytes, RandomString} = require("./utils/Utils");
const ClientConfiguration = require("../TestConfiguration.json");
const configUrl = process.env["CONFIG_URL"] || ClientConfiguration["config-url"];

describe("Test Utils", () => {
  test("ElvClient Utils", async () => {
    const w = globalThis.window;
    globalThis.window = undefined;

    const client = await ElvClient.FromConfigurationUrl({configUrl});
    SetNodes(client);

    expect(client.utils).toBeDefined();

    globalThis.window = w;
  });

  test("FrameClient Utils", () => {
    const client = new FrameClient({target: undefined});

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

  test("Decode Version Hash", () => {
    const versionHash = "hq__7cTGD2eMTZMrvLT7SqCtsoJx9cWzy5QBLqcBqSdPtGaXuoYJPaEA22CX3LGZPpMXURCdpzFwS1";

    const {digest, size, objectId} = Utils.DecodeVersionHash(versionHash);

    expect(digest).toEqual("51ffc779deeaab3224c5cc9abc3279effe0768864f8eb1d9356ad608eda12b3e");
    expect(size).toEqual(136);
    expect(objectId).toEqual("iq__2tNqMTr51szPGsttFQJSq6gRdKaZ");
  });

  test("Decode Write Token errors", () => {
    expect(() => {
      // 'tunk' is treated as invalid
      Utils.DecodeWriteToken("tunkHSa9UBm1dHmrLsz5GUu3D9NVscUshTBjW3TP2BckZzGzNHPtMEnWbpCDsiqB971qdYpy1oSemHMqTR1YsMs");
    }).toThrow();
    expect(() => {
      // unknown prefix
      Utils.DecodeWriteToken("tblaHSa9UBm1dHmrLsz5GUu3D9NVscUshTBjW3TP2BckZzGzNHPtMEnWbpCDsiqB971qdYpy1oSemHMqTR1YsMs");
    }).toThrow();
    expect(() => {
      // valid prefix but too short
      Utils.DecodeWriteToken("tq__");
    }).toThrow();
    expect(() => {
      // too short
      Utils.DecodeWriteToken("__");
    }).toThrow();
  });

  test("Decode Content Write Token Backward Compat", () => {
    let writeToken = "tqw__HSa9UBm1dHmrLsz5GUu3D9NVscUshTBjW3TP2BckZzGzNHPtMEnWbpCDsiqB971qdYpy1oSemHMqTR1YsMs";
    let token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inod2vU5Lc28S9pcx96m2gbP4YMYeGRs");
    expect(token.objectId).toEqual("iq__4ZKDfwY1EtDbJvsJTDZLrTDb6H6b");
    expect(token.tokenId).toEqual("0xe45daaca900e5987d9de4ad769713e1a");

    writeToken = "tqw__8UmhDD9cZah58THfAYPf3Shj9hVzfwT51Cf4ZHKpayajzZRyMwCPiSpfS5yqRZfjkDjrtXuRmDa";
    token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inod3Sa5p3czRyYi8GnVGnh8gBDLaqJr");
    expect(token.objectId).toEqual("iq__99d4kp14eSDEP7HWfjU4W6qmqDw");
    expect(token.tokenId).toEqual("0x00010203040506070809");

    // token with arbitrary size of fields
    writeToken = "tqw__RRceZrF4GMkYHyXy9pD7wqvSLYxXbHxfNRPoQ8M1HuLsgRytg3GvimtfzdniU";
    token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inodBCzMsgCFoE629MAQih53ZP");
    expect(token.objectId).toEqual("iq__XkHB7orSPYxxZYH8YQwA6F");
    expect(token.tokenId).toEqual("0x66d17d8bd7e23869");
  });

  test("Decode Content Write Token", () => {
    let writeToken = "tq__HSa9UBm1dHmrLsz5GUu3D9NVscUshTBjW3TP2BckZzGzNHPtMEnWbpCDsiqB971qdYpy1oSemHMqTR1YsMs";
    let token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inod2vU5Lc28S9pcx96m2gbP4YMYeGRs");
    expect(token.objectId).toEqual("iq__4ZKDfwY1EtDbJvsJTDZLrTDb6H6b");
    expect(token.tokenId).toEqual("0xe45daaca900e5987d9de4ad769713e1a");

    writeToken = "tq__8UmhDD9cZah58THfAYPf3Shj9hVzfwT51Cf4ZHKpayajzZRyMwCPiSpfS5yqRZfjkDjrtXuRmDa";
    token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inod3Sa5p3czRyYi8GnVGnh8gBDLaqJr");
    expect(token.objectId).toEqual("iq__99d4kp14eSDEP7HWfjU4W6qmqDw");
    expect(token.tokenId).toEqual("0x00010203040506070809");

    // token with arbitrary size of fields
    writeToken = "tq__RRceZrF4GMkYHyXy9pD7wqvSLYxXbHxfNRPoQ8M1HuLsgRytg3GvimtfzdniU";
    token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inodBCzMsgCFoE629MAQih53ZP");
    expect(token.objectId).toEqual("iq__XkHB7orSPYxxZYH8YQwA6F");
    expect(token.tokenId).toEqual("0x66d17d8bd7e23869");

    // token with (very) large qid.
    // Note that in practice the fabric refuses to decode IDs larger than 50 bytes
    writeToken = "tq__2BjnUpjP1jUSA13ksbYDCrQQLKSbPLxPPh2Z4D8MGmLiE739t1ZZv4MrjVUdmdph841XPGSDG142VJEv1uqQ64LCR3nHay76qPZbFoX6iWGNEMKmvk2AMTCYtpk7e2etNyfgnjSZAeRqJLwHuarVQ3MuugTNmFD9EkqDPnysGm85on3jKaBnG1WbASDLgFxnWkTawmHixMhRB4tAdHvZF9tt96kXHomLhnYsi7fvgQqrVKAXM3DBRb3ZT4iqvk7uuZPA94FQ39zvFMo5TebVcz8SZs6xUsobR13wXS9bKx9w6nsRLjuQP6mhCeU";
    token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tq__");
    expect(token.nodeId).toEqual("inodGqK7hQHZq8sZxSMVyBMkhj");
    expect(token.objectId).toEqual("iq__2Q9JkLJ7gdj2VxYQk2mC4nwx79Fpi6B9v7fNwZoPFZ3Fbg1aw8fBtbDjMq81uDdyZZxjnhQ5MsYfvBS24pWzgBVb3415zC61PjQs44EsBYkjfLriGPsW1giUFp6Yib5KfKntVo81JxMqr2YS9ytfivXi6fpodwBXi3TPAdpzE3YeFFxcerzsFZx7XDQp5WBm8yy6BuB96JPwF4Uf388igR3RwNMAjMTjQCUQHiGG3jjui38Qd5PzUX89N8c5gNy6D4BoaAqp85p9Jf33L9");
    expect(token.tokenId).toEqual("0xf26e79e93e403929");

  });

  test("Decode Write Token V1", () => {
    // content
    let writeToken = "tqw_VCaS4Fu2YTMQqye1YKZq2Z";
    let token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tqw_");
    expect(token.nodeId).toBeUndefined();
    expect(token.objectId).toBeUndefined();
    expect(token.tokenId).toEqual("0xe45daaca900e5987d9de4ad769713e1a");

    // part
    writeToken = "tqpwVCaS4Fu2YTMQqye1YKZq2Z";
    token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tqpw");
    expect(token.nodeId).toBeUndefined();
    expect(token.objectId).toBeUndefined();
    expect(token.tokenId).toEqual("0xe45daaca900e5987d9de4ad769713e1a");
  });

  test("Decode LRO Write Token", () => {
    let writeToken = "tlro1Ejg3egYpJjnaq25zLSMu36Wwy9x5xRo8VGYoEtRrmgFF5zGjR3ejK";
    let token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tlro");
    expect(token.nodeId).toEqual("inod2vU5Lc28S9pcx96m2gbP4YMYeGRs");
    expect(token.objectId).toEqual("");
    expect(token.tokenId).toEqual("0xe45daaca900e5987d9de4ad769713e1a");
  });

  test("Decode Content Part Write Token", () => {
    let writeToken = "tqp_NHGRyE3AwejspuyQzBctV3btM";
    let token = Utils.DecodeWriteToken(writeToken);
    expect(token.tokenType).toEqual("tqp_");
    expect(token.nodeId).toBeUndefined();
    expect(token.objectId).toBeUndefined();
    expect(token.tokenId).toEqual("0xe45daaca900e5987d9de4ad769713e1a");
    expect(token.scheme).toEqual(2);
    expect(token.flags).toEqual(1);
  });

  test("Bytes32 Conversion", () => {
    expect(Utils.ToBytes32("Hello World!")).toEqual("0x48656c6c6f20576f726c64210000000000000000000000000000000000000000");
  });

  test("Ether Conversion", () => {
    expect(Utils.weiPerEther.eq("1000000000000000000"));

    const ether = Utils.WeiToEther(Utils.weiPerEther);
    expect(ether.eq(Utils.ToBigNumber("1.0"))).toBeTruthy();

    const wei = Utils.EtherToWei("1.0");
    expect(wei.eq(Utils.weiPerEther)).toBeTruthy();
  });

  test("Image URL Resizing", () => {
    const imageUrl = "https://host-35-233-145-232.test.contentfabric.io/q/hq__GcEUxBe7JRZWMJDD3auYmb8r5BxwN9zrXtyUtMYWk2HFg958WZD1d4ZZqZJT9fUDWMsqn11Kfm/meta/public/profile_image?resolve=true&authorization=eyJxc3BhY2VfaWQiOiJpc3BjMnpxYTRnWjhOM0RIMVFXYWtSMmU1VW93RExGMSIsImFkZHIiOiIweDgxYTViMDU4ZGU3MTYxMzA4ZTE2YTQzYjQyN2YwMWY5ODhhOTNmYTUifQ%3D%3D.RVMyNTZLXzhlRnh5RVZqOFZkcTNyd3lpQjN2QThrTmg0dEJSaG95UFlyM2dyNHJvQ3BCWFJoTXo0aU1tN3dyb3JCTTVkZnpUR2NOaG03Ym5WZE5VU1ZXTUhIcU1mNzVt";

    // Set height
    const height500 = Utils.ResizeImage({
      imageUrl: imageUrl,
      height: 500
    });

    expect(URI(height500).search(true).height).toEqual("500");

    // Change height
    const height1000 = Utils.ResizeImage({
      imageUrl: height500,
      height: 1000
    });

    expect(URI(height1000).search(true).height).toEqual("1000");

    // Remove height
    const noHeight = Utils.ResizeImage({imageUrl: height1000});

    expect(URI(noHeight).search(true).height).not.toBeDefined();
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

if(!module.parent) { runTests(); }
module.exports = runTests;
