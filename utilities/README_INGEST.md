# Media Ingest

## CLI: `utilities/MediaIngest.js`

Ingest a video file from disk or S3 into a new or existing fabric object.

Uses a single fabric object (no separate 'master' object) and does not store the source files with the object.

Three source modes:

| Source mode | Option | Fabric behavior | Source cleanup after ABR finalization |
| --- | --- | --- | --- |
| Local upload | none | Uploads and encrypts the file in the object | Deletes the uploaded Fabric file |
| S3 copy | `--s3-copy` | Server-side copies and encrypts the S3 object into the Fabric | Deletes the copied Fabric file |
| S3 reference | `--s3-reference` | Adds a link to the S3 object without copying or Fabric encryption | Retains the Fabric S3 reference |

Cleanup only affects files in the Fabric draft. MediaIngest never deletes the original local file or the original S3 object.

## Prerequisites

```sh
npm ci
export PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
export FABRIC_CONFIG_URL="https://main.net955305.contentfabric.io/config"
```

Instead of `FABRIC_CONFIG_URL` you can use `--config-url URL` or `--network main|demvo3`.

## Local upload

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "Local source" \
  --files /absolute/path/to/source.mxf
```

If media comes from multiple source files:

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "Separate video and audio" \
  --files /absolute/path/to/picture.mxf /absolute/path/to/english.wav
```

## S3 reference with a presigned URL

The value passed to `--files` is the S3 object key, not the URL. The signed URL is specified in the credentials JSON. Its `path_matchers` entry is a regular expression matched against the object key.

`credentials-reference-signed.json`:

```json
[
  {
    "path_matchers": ["^media/source\\.mxf$"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "cloud_credentials": {
        "signed_url": "https://example-ingest-bucket.s3.us-west-2.amazonaws.com/media/source.mxf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=REDACTED&X-Amz-Signature=REDACTED"
      }
    }
  }
]
```

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "S3 reference, signed URL" \
  --s3-reference \
  --credentials ./credentials-reference-signed.json \
  --files media/source.mxf
```

For signed URLs, `remote_access.path` (bucket) and `storage_endpoint.region` are optional. The URL must authorize `GET` access and remain valid long enough for source inspection and transcoding.

## S3 reference with an access key and secret key

`credentials-reference-aksk.json`:

```json
[
  {
    "path_matchers": ["^s3://example-ingest-bucket/media/source\\.mxf$"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "path": "example-ingest-bucket/",
      "storage_endpoint": {
        "region": "us-west-2"
      },
      "cloud_credentials": {
        "access_key_id": "YOUR_AWS_ACCESS_KEY_ID",
        "secret_access_key": "YOUR_AWS_SECRET_ACCESS_KEY"
      }
    }
  }
]
```

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "S3 reference, access key" \
  --s3-reference \
  --credentials ./credentials-reference-aksk.json \
  --files s3://example-ingest-bucket/media/source.mxf
```

The bucket in a full `s3://` source must match `remote_access.path`. A bare key such as `media/source.mxf` also works when the credential file supplies the bucket.

## S3 copy with a presigned URL

`credentials-copy-signed.json`:

```json
[
  {
    "path_matchers": ["^media/source\\.mxf$"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "cloud_credentials": {
        "signed_url": "https://example-ingest-bucket.s3.us-west-2.amazonaws.com/media/source.mxf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=REDACTED&X-Amz-Signature=REDACTED"
      }
    }
  }
]
```

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "S3 copy, signed URL" \
  --s3-copy \
  --credentials ./credentials-copy-signed.json \
  --files media/source.mxf
```

The server copies the object from S3 into the Fabric and then deletes the Fabric copy after the ABR mezzanine is finalized.

## S3 copy with an access key and secret key

`credentials-copy-aksk.json`:

```json
[
  {
    "path_matchers": ["^s3://example-ingest-bucket/media/source\\.mxf$"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "path": "example-ingest-bucket/",
      "storage_endpoint": {
        "region": "us-west-2"
      },
      "cloud_credentials": {
        "access_key_id": "YOUR_AWS_ACCESS_KEY_ID",
        "secret_access_key": "YOUR_AWS_SECRET_ACCESS_KEY"
      }
    }
  }
]
```

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "S3 copy, access key" \
  --s3-copy \
  --credentials ./credentials-copy-aksk.json \
  --files s3://example-ingest-bucket/media/source.mxf
```

The reference and copy credential schemas are identical; the command-line mode determines whether the S3 object is linked or copied.

Access-key credentials can alternatively come from the environment:

```sh
export AWS_REGION="us-west-2"
export AWS_BUCKET="example-ingest-bucket"
export AWS_KEY="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET="YOUR_AWS_SECRET_ACCESS_KEY"

node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "S3 copy, environment credentials" \
  --s3-copy \
  --files media/source.mxf
```

## S3 credential matching and security

Each entry in a credentials file applies to source paths matching one of its `path_matchers` regular expressions. Every S3 source must match an entry.

A normal S3 presigned URL authorizes one object. For multiple signed sources, use one credential entry and exact matcher per object:

```json
[
  {
    "path_matchers": ["^media/video\\.mxf$"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "cloud_credentials": {
        "signed_url": "https://example-ingest-bucket.s3.amazonaws.com/media/video.mxf?X-Amz-Signature=REDACTED"
      }
    }
  },
  {
    "path_matchers": ["^media/audio\\.wav$"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "cloud_credentials": {
        "signed_url": "https://example-ingest-bucket.s3.amazonaws.com/media/audio.wav?X-Amz-Signature=REDACTED"
      }
    }
  }
]
```

The access key, secret key, and presigned URL are sent for the S3 operation but are not stored by the client or in Fabric metadata.

## Audio

> TODO

## HDR10

Pass an HDR metadata file with `--hdr-info-file`:

`hdr-info.json`:

```json
{
  "master_display": "G(13250,34500)B(7500,3000)R(34000,16000)WP(15635,16450)L(10000000,1)",
  "max_cll": "1000,400"
}
```

```sh
node utilities/MediaIngest.js \
  --library-id ilib... \
  --title "HDR10 source" \
  --files /absolute/path/to/hdr-source.mxf \
  --hdr-info-file ./hdr-info.json
```

## DRM and clear playback

The built-in profile contains both clear and DRM playout formats - MediaIngest selects only one group for each ingest:

| Command-line setting | Effective playout formats |
| --- | --- |
| No DRM argument | Clear DASH and clear HLS only |
| `--no-drm` | Clear DASH and clear HLS only |
| `--drm` | All DRM formats listed below; no clear formats |

The `--drm` option defaults to `false`.

With `--no-drm`, explicitly selects clear-only.

With `--drm`, MediaIngest retains these protected formats from the built-in profile:

- DASH Widevine
- HLS Widevine CENC
- HLS FairPlay
- HLS PlayReady CENC
- HLS Sample AES
- HLS AES-128

The profile stores mezzanine media encrypted at rest (`store_clear: false`) in either mode.

## ABR profile and variants

MediaIngest always uses the built-in [`abr_profile_4k_all.json`](utilities/lib/abr_profiles/abr_profile_4k_all.json). There is currently no command-line option for supplying a different ABR profile but you can modify the JSON file as needed.

The video profile is parametric. These are its base rungs for a 16:9, 30 fps source:

| Base rung | Base bitrate |
| --- | ---: |
| 3840x2160 | 14 Mbps |
| 2560x1440 | 11.5 Mbps |
| 1920x1080 | 9.5 Mbps |
| 1280x720 | 4.5 Mbps |
| 854x480 | 1.75 Mbps |
| 640x360 | 810 Kbps |
| 426x240 | 500 Kbps |

At ingest time, the profile generator adapts rung dimensions to the source aspect ratio, snaps near-standard aspect ratios when they are within 6%, and adjusts bitrates for the source frame rate relative to the 30 fps base. It never upscales (eg. a 1920x1080 source has no 1440p or 2160p output). The profile accepts source frame rates from 15 through 60 fps and caps a generated video rung at 30 Mbps. An audio-only variant produces no video ladder.

The base profile does not force a video codec. When `--hdr-info-file` is present, MediaIngest adds HEVC (`h265`) and 10-bit encoding requirements to the generated profile. Both audio and video use a two-second segment target with 15 segments per chunk. The audio ladder contains pregenerated rungs for mono at 128 Kbps, stereo at 192 Kbps, and 5.1 at 384 Kbps.

Variants and offerings are separate selections:

- `--variant-key KEY` selects an existing production-master variant and defaults to `default`. It does not create or modify a variant. MediaIngest does not pass a `streamKeys` filter, so all streams in the selected variant are included in mezzanine creation.
- `--offering-key KEY` selects the mezzanine offering to create and also defaults to `default`. Changing it does not change which production-master streams are selected.


## Existing objects and finalization

To ingest into an existing object, pass `--object-id` instead of `--library-id`. The utility discovers the object's library and opens a draft:

```sh
node utilities/MediaIngest.js \
  --object-id iq__... \
  --title "Replacement ingest" \
  --files /absolute/path/to/source.mxf
```

`--title` is only required for a newly created object

By default the completed object is finalized and MediaIngest waits for publication. `--no-finalize` leaves the object draft open and prints its write token and node. Source cleanup still occurs after ABR finalization even when object finalization is skipped.

## Operational notes

- Local upload, S3 copy, and S3 reference are mutually exclusive invocation-wide modes. Do not mix local and S3 paths in one run.
- Every input is stored at `path.basename(source)`. Inputs from different directories that share a filename therefore collide.
- Captions/subtitles, explicit language labels, custom stream maps, clipping, watermarks, and custom ABR profiles are not exposed by MediaIngest.
- Progress is written to `./ingest-status.json`, including the object ID and write token. Automatic restart/resume though is not currently implemented
- If ingest fails before cleanup, uploaded or copied sources may remain in the open draft. Use the reported object ID/write token and `ingest-status.json` for diagnosis and manual cleanup.

Run `node utilities/MediaIngest.js --help` for the complete option list.
