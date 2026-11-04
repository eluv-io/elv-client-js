const assert = require("assert");
const TestSuite = require("./TestSuite/TestSuite");
const {describe, test, runTests} = new TestSuite();
const {StreamCopyToVod} = require("../src/client/LiveStream");
const profile = require("../src/abr_profiles/abr_profile_live_to_vod");

const recordingConfig = {
  source_timescale: 90000,
  xc_params: {
    video_seg_duration_ts: 3456000,
    audio_seg_duration_ts: 1843200,
    sample_rate: 48000
  }
};

const RunCopy = async ({recordingParams=recordingConfig, options={}, existing={}, generated={}, draftOnlyCaps=false}={}) => {
  const calls = [];
  const metadataCalls = [];
  const finalizeRequests = [];
  const targetWriteToken = options.writeToken || "tqw__target";
  const updates = [];
  const order = [];
  let initialized = false;
  const client = {
    StreamStatus: async options => {
      assert.deepStrictEqual(options, {name: "iq__live", showParams: true});
      return {libraryId: "ilibLive", recordingParams, lroStatusUrl: "https://example.test/live/status"};
    },
    Log: () => {},
    ContentObjectLibraryId: async () => "ilibTarget",
    authClient: {KMSAddress: async () => "kms"},
    utils: {AddressToHash: () => "kmsHash", ResponseToJson: async response => response},
    ContentObjectMetadata: async ({metadataSubtree, writeToken}) => {
      metadataCalls.push({metadataSubtree, writeToken});
      if(!metadataSubtree.startsWith("offerings/")) {
        return !draftOnlyCaps || writeToken === options.writeToken ? {} : null;
      }
      assert.strictEqual(writeToken, targetWriteToken);
      return JSON.parse(JSON.stringify((initialized ? generated : existing)[metadataSubtree] || null));
    },
    LatestVersionHash: async () => "hq__live",
    EditContentObject: async () => {
      order.push("edit");
      return {writeToken: "tqw__target"};
    },
    CallBitcodeMethod: async options => {
      calls.push(options);
      order.push(options.method);
      if(options.method === "/media/live_to_vod/init") { initialized = true; }
    },
    ReplaceMetadata: async options => {
      updates.push(options);
      order.push("restore");
    },
    FinalizeContentObject: async request => {
      finalizeRequests.push(request);
      order.push("finalize");
      return {hash: "hq__vod"};
    }
  };

  const status = await StreamCopyToVod.call(client, {
    name: "iq__live", targetObjectId: "iq__vod", finalize: false, ...options
  });
  const init = calls.find(call => call.method === "/media/abr_mezzanine/init").body;
  const liveInit = calls.find(call => call.method === "/media/live_to_vod/init").body;
  return {profile: init.abr_profile, init, liveInit, calls, updates, order, status, metadataCalls, finalizeRequests};
};

const Copy = async recordingParams => (await RunCopy({recordingParams: recordingParams ?? null})).profile;

describe("Live stream copy to VOD segment timing", () => {
  test("uses 2.56-second audio and video segments from configuration", async () => {
    const result = await Copy({
      source_timescale: 90000,
      xc_params: {
        video_seg_duration_ts: 3456000,
        audio_seg_duration_ts: 1843200,
        sample_rate: 48000
      }
    });
    assert.strictEqual(result.segment_specs.audio.target_dur, 2.56);
    assert.strictEqual(result.segment_specs.video.target_dur, 2.56);
    assert.strictEqual(result.segment_specs.video.segs_per_chunk, 15);
  });

  test("preserves independent timing and leaves the shared profile unchanged", async () => {
    const original = JSON.parse(JSON.stringify(profile));
    const result = await Copy({
      source_timescale: 60000,
      xc_params: {
        video_seg_duration_ts: 1801800,
        audio_seg_duration_ts: 1312416,
        sample_rate: 44100
      }
    });
    assert.strictEqual(result.segment_specs.audio.target_dur, 1.984);
    assert.strictEqual(result.segment_specs.video.target_dur, 2.002);
    assert.deepStrictEqual(profile, original);
  });

  test("rejects missing or invalid timing before creating a target draft", async () => {
    await assert.rejects(Copy(undefined), /Bad recording config segment duration - audio/);
    await assert.rejects(Copy({
      source_timescale: 0,
      xc_params: {audio_seg_duration_ts: 1843200, sample_rate: 48000}
    }), /Bad recording config segment duration - video/);
  });
});


describe("Live stream copy to VOD options", () => {
  test("defaults to clear HLS and DASH without optional offerings or tag copying", async () => {
    const {profile, init, liveInit, order} = await RunCopy();
    assert.deepStrictEqual(Object.keys(profile.playout_formats), ["hls-clear", "dash-clear"]);
    assert.strictEqual(profile.store_clear, true);
    assert.strictEqual(init.keep_other_streams, false);
    assert.strictEqual(init.additional_offering_specs, undefined);
    assert.strictEqual(liveInit.include_tags, false);
    assert.ok(!order.includes("finalize"));
  });

  test("selects DRM formats and retains exact configured timing", async () => {
    const drmProfile = require("../src/abr_profiles/abr_profile_live_to_vod_drm");
    const original = JSON.parse(JSON.stringify(drmProfile));
    const {profile} = await RunCopy({options: {drm: true}});
    assert.strictEqual(profile.store_clear, false);
    assert.deepStrictEqual(Object.keys(profile.playout_formats), [
      "dash-widevine", "hls-fairplay", "hls-aes128", "hls-playready-cenc"
    ]);
    assert.strictEqual(profile.segment_specs.audio.target_dur, 2.56);
    assert.strictEqual(profile.segment_specs.video.target_dur, 2.56);
    assert.deepStrictEqual(drmProfile, original);
    assert.strictEqual((await RunCopy()).profile.store_clear, true);
  });

  test("passes tags, stream preservation, track selection and clipping options", async () => {
    const streams = {video: {stream_index: 0}, audio: {stream_index: 1}};
    const {init, liveInit} = await RunCopy({options: {
      includeTags: true, keepExistingStreams: true, streams,
      recordingPeriod: 2, startTime: "2026-11-03T10:00:00Z", endTime: "2026-11-03T11:00:00Z"
    }});
    assert.strictEqual(init.keep_other_streams, true);
    assert.strictEqual(liveInit.include_tags, true);
    assert.deepStrictEqual(liveInit.streams, streams);
    assert.strictEqual(liveInit.recording_period, 2);
    assert.strictEqual(liveInit.start_time, "2026-11-03T10:00:00Z");
    assert.strictEqual(liveInit.end_time, "2026-11-03T11:00:00Z");
  });

  test("adds a separate clear DASH offering when DRM is enabled", async () => {
    const {init} = await RunCopy({options: {drm: true, defaultDash: true}});
    assert.deepStrictEqual(init.additional_offering_specs, {
      default_dash: [{
        op: "replace", path: "/playout/playout_formats",
        value: {"dash-clear": {drm: null, protocol: {min_buffer_length: 2, type: "ProtoDash"}}}
      }]
    });
    assert.strictEqual(init.abr_profile.playout_formats["dash-clear"], undefined);
  });

  test("restores both offerings' trim points after mezzanine finalization", async () => {
    const {updates, order, status} = await RunCopy({
      options: {finalize: true, defaultDash: true},
      existing: {
        "offerings/default": {entry_point_rat: 0, exit_point_rat: "125/2"},
        "offerings/default_dash": {exit_point_rat: "65"}
      },
      generated: {
        "offerings/default": {entry_point_rat: "10", exit_point_rat: "100", media_struct: {streams: {}}},
        "offerings/default_dash": {entry_point_rat: "5", exit_point_rat: "100"}
      }
    });
    assert.strictEqual(updates.length, 2);
    assert.deepStrictEqual(updates[0].metadata, {
      entry_point_rat: 0, exit_point_rat: "125/2", media_struct: {streams: {}}
    });
    assert.deepStrictEqual(updates[1].metadata, {entry_point_rat: "5", exit_point_rat: "65"});
    for(const update of updates) {
      assert.strictEqual(update.writeToken, "tqw__target");
      assert.strictEqual(update.objectId, "iq__vod");
      assert.strictEqual(update.libraryId, "ilibTarget");
    }
    assert.ok(order.indexOf("restore") > order.indexOf("/media/abr_mezzanine/offerings/default/finalize"));
    assert.strictEqual(order.at(-1), "finalize");
    assert.strictEqual(status.targetHash, "hq__vod");
  });

  test("skips restoration for removed offerings and offerings without saved points", async () => {
    const {updates} = await RunCopy({
      existing: {"offerings/default": {entry_point_rat: "1"}, "offerings/default_dash": {}},
      generated: {"offerings/default_dash": {exit_point_rat: "10"}}
    });
    assert.deepStrictEqual(updates, []);
  });

  test("still requires an existing target object", async () => {
    await assert.rejects(RunCopy({options: {targetObjectId: undefined}}), /Object ID not specified/);
  });
});


describe("Live stream copy to VOD event lookup", () => {
  test("resolves event boundaries using the client status URL", async () => {
    const HttpClient = require("../src/HttpClient");
    const originalFetch = HttpClient.Fetch;
    let fetchedUrl;
    HttpClient.Fetch = async url => {
      fetchedUrl = url;
      return {custom: {cues: {
        start: {insertion_time: "2026-11-03T10:00:00Z", descriptors: [{id: "event1", type_id: 16}]},
        end: {insertion_time: "2026-11-03T11:00:00Z", descriptors: [{id: "event1", type_id: 17}]}
      }}};
    };
    try {
      const {liveInit} = await RunCopy({options: {eventId: "event1"}});
      assert.strictEqual(fetchedUrl, "https://example.test/live/status");
      assert.strictEqual(liveInit.start_time, "2026-11-03T10:00:00Z");
      assert.strictEqual(liveInit.end_time, "2026-11-03T11:00:00Z");
    } finally {
      HttpClient.Fetch = originalFetch;
    }
  });
});


describe("Live stream copy to VOD draft reuse", () => {
  test("uses the supplied draft for CAPS, media calls and point restoration without opening or committing a draft", async () => {
    const writeToken = "tqw__supplied";
    const {calls, metadataCalls, updates, order, status, finalizeRequests} = await RunCopy({
      options: {writeToken, finalize: false},
      draftOnlyCaps: true,
      existing: {"offerings/default": {entry_point_rat: "1"}},
      generated: {"offerings/default": {entry_point_rat: "0"}}
    });
    assert.ok(!order.includes("edit"));
    assert.ok(!order.includes("finalize"));
    assert.deepStrictEqual(finalizeRequests, []);
    assert.strictEqual(status.targetWriteToken, writeToken);
    assert.ok(metadataCalls.length >= 4);
    for(const call of [...metadataCalls, ...calls, ...updates]) {
      assert.strictEqual(call.writeToken, writeToken);
    }
    assert.strictEqual(updates.length, 1);
    assert.strictEqual(updates[0].metadata.entry_point_rat, "1");
  });

  test("finalizes the supplied draft when finalization is enabled", async () => {
    const writeToken = "tqw__supplied";
    const {order, status, finalizeRequests} = await RunCopy({options: {writeToken, finalize: true}});
    assert.ok(!order.includes("edit"));
    assert.strictEqual(finalizeRequests.length, 1);
    assert.strictEqual(finalizeRequests[0].writeToken, writeToken);
    assert.strictEqual(status.targetHash, "hq__vod");
  });

  test("opens a draft when no write token is supplied", async () => {
    const {order, status} = await RunCopy();
    assert.strictEqual(order.filter(action => action === "edit").length, 1);
    assert.strictEqual(status.targetWriteToken, "tqw__target");
  });
});

if(!module.parent) {
  runTests().then(stats => process.exit(stats.failed.length > 0 ? 1 : 0)).catch(error => {
    console.error(error);
    process.exit(1);
  });
}
module.exports = runTests;
