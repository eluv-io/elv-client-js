<link rel="stylesheet" type="text/css" media="all" href="index.css" />

<a id="contents"></a>

# Eluvio Content Fabric: Ingesting Media for Adaptive Bit Rate (ABR) Streaming

*last revised: 2021-04-14*

  * [Basic Concepts](#basic-concepts)
  * [Preparation](#preparation)
    * [Find your Content Fabric private key and record it in a safe place](#find-your-content-fabric-private-key-and-record-it-in-a-safe-place)
    * [Download and set up the elv-client-js library](#download-and-set-up-the-elv-client-js-library)
    * [Updating your copy of elv-client-js](#updating-your-copy-of-elv-client-js)
  * [DEPRECATION NOTICE](#deprecation-notice)
  * [Create a Production Master object](#create-a-production-master-object)
    * [Get your Production Master Content Type name and/or ID](#get-your-production-master-content-type-name-andor-id)
    * [Get your Production Master Library ID](#get-your-production-master-library-id)
    * [Create from a file on AWS S3](#create-from-a-file-on-aws-s3)
    * [Create from a local file](#create-from-a-local-file)
    * [Check output from CreateProductionMaster.js script](#check-output-from-createproductionmaster)
    * [Grant Group Permissions on Production Master object - via browser](#grant-permissions-on-production-master-object---via-browser)
    * [Grant Group Permissions on Production Master object - via command line](#grant-permissions-on-production-master-object---via-command-line)
  * [(If needed) Change streams on Production Master Variant](#change-streams-on-production-master-variant)
    * [Display Production Master Stream Info](#display-production-master-stream-info)
    * [Add stream to Production Master Variant](#add-stream-to-production-master-variant)
    * [Edit existing stream in Production Master Variant](#edit-existing-stream-in-production-master-variant)
    * [Remove existing stream from Production Master Variant](#remove-existing-stream-from-production-master-variant)
  * [Create a Mezzanine object](#create-a-mezzanine-object)
    * [Find the latest version hash for your Production Master](#find-the-latest-version-hash-for-your-production-master)
    * [Get your Mezzanine Content Type name and/or ID](#get-your-mezzanine-content-type-name-andor-id)
    * [Get your Mezzanine Library ID](#get-your-mezzanine-library-id)
    * [Choose an ABR Profile](#choose-an-abr-profile)
    * [Create the Mezzanine object](#create-the-mezzanine-object)
    * [Successful creation of Mezzanine object](#successful-creation-of-mezzanine-object)
    * [Checking Mezzanine transcoding status](#checking-mezzanine-transcoding-status)
  * [Finalize your Mezzanine object](#finalize-your-mezzanine-object)
    * [Set Mezzanine object visibility to 'Viewable' - via browser](#set-viz-mez-browser)
    * [Set Mezzanine object visibility to 'Viewable' - via command line](#set-viz-mez-command-line)
    * [Grant Group Permissions on Mezzanine object - via browser](#grant-permissions-on-mezzanine-object-via-browser)
    * [Grant Group Permissions on Mezzanine object - via command line](#grant-permissions-on-mezzanine-object-via-command-line)
  * [Adding caption stream(s) to an Offering](#adding-captions-to-offering)
  * [Duplicating an existing Offering](#duplicating-an-existing-offering)
    * [Viewing Offerings other than "default"](#viewing-offerings-other-than-default)
  * [Adding / removing playout options from an Offering](#adding--removing-playout-options-from-an-offering)
    * [Adding Clear (DRM-free) playout option](#adding-clear-drm-free-playout-option)
    * [Removing Clear (DRM-free) playout option](#removing-clear-drm-free-playout-option)
    * [Removing DRM playout option](#removing-drm-playout-option)
    * [Displaying the resolution ladder for an Offering](#displaying-the-resolution-ladder-for-an-offering)
    * [Adding a rung to an Offering's video playout resolution ladder](#adding-a-rung-to-an-offerings-video-playout-resolution-ladder)
    * [Removing a rung from an Offering's video playout resolution ladder](#removing-a-rung-from-an-offerings-video-playout-resolution-ladder)
  * [Example Scenarios](#example-scenarios)
    * [Adding a stereo stream created from 2 mono streams to a Production Master Variant](#adding-a-stereo-stream-created-from-2-mono-streams-to-a-production-master-variant)
    * [Adding a stereo stream created from a single mono stream to a Production Master Variant](#adding-a-stereo-stream-created-from-a-single-mono-stream-to-a-production-master-variant)
    * [Adding a 'clear playout' Offering to a DRM-protected Mezzanine](#adding-a-clear-playout-offering-to-a-drm-protected-mezzanine)
  * [Language Codes and Labels](#language-codes-and-labels)

<a id="basic-concepts"></a>
## Basic Concepts&nbsp;[&#8673;](#contents)

In the Content Fabric, ingesting video for streaming involves two kinds of objects, **Production Masters** and **ABR Mezzanines**:

* **Production Masters**
	* Usually very high bitrate/resolution
	* Often encoded with Prores / JPEG2000 video and PCM (raw) Audio
	* Accessible only to content owners / admins
	* Not directly viewable from Content Fabric (yet)
	* Made up of 1 or more media files (referred to as **Sources**) that are often kept in AWS S3, although if desired they can also be uploaded to the Content Fabric and stored there
	* Defines 1 or more **Variants**, e.g.:
		* Theatrical release version
		* TV broadcast version
		* In-flight version
		* Market- or country-specific version(s)
	* Unless otherwise specified, on initial creation always starts with one **Variant** named `default`
	* A **Variant** specifies which files (**Sources**) to use and which stream(s) to include from each.

* **ABR Mezzanines**
	* Generally lower bitrate and/or resolution than Production Masters
	* Encoded with h264 or h265 video and AAC audio
	* Directly viewable from the Content Fabric
	* Stored in the Content Fabric
	* Optimized for low-latency streaming
	* Can contain custom metadata, e.g.:
	   * Internal asset ID
	   * External ID(s)
	   * Synopsis, Ratings, Genre, Cast, Crew
	     * Defaults (usually English)
	     * Territory and/or language-specific overrides
	* Defines 1 or more **Offerings**. Each **Offering** specifies the following:
		* What **Production Master** and **Variant** within to stream
		* What resolutions and bitrates to offer
		* What streaming protocol(s) to offer (DASH and/or HLS) and what kind(s) of DRM to use for each (an **Offering** can include both DRM and clear playout options if desired)
		* Watermark text or image (if any)
		* Caption/subtitle streams (if any)
		* Whether to trim media from the beginning and/or end of the **Production Master**'s **Variant** and if so how much
		* An **Offering** initially contains the same streams as the **Production Master** **Variant** that was used to create it, but can be edited after creation to add or remove streams (e.g. adding a subtitle stream or removing an audio language track)

The ingest process consists of the following steps:

1. Create a **Production Master** object that points to your master source files (alternately, local master source files can be uploaded to the fabric)
2. Create an **ABR Mezzanine** object that points to the **Production Master** and adds streaming resolutions / bitrates as well as any DRM / watermarking. Once you create the mezzanine, the Content Fabric will begin transcoding.
3. Finalize the **ABR Mezzanine** after transcoding has finished.
4. (Optionally) Setting trim points and/or adding subtitles

_NOTE: Although currently caption/subtitle files are added to **ABR Mezzanines** separately after creation, in the future this may be changed so that they are part of the original **Production Master** instead._

<a id="preparation"></a>
## Preparation&nbsp;[&#8673;](#contents)

<a id="find-your-content-fabric-private-key-and-record-it-in-a-safe-place"></a>
### Find your Content Fabric private key and record it in a safe place&nbsp;[&#8673;](#contents)


1. Navigate to the Content Fabric Browser page
	* 	If you have been set up on our **demo** network, go to: [https://core.demov3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/](https://core.demov3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/)
	* 	If you have been set up on our **production** network, go to:
[https://core.v3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/](https://core.v3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/)
1. Enter the password you chose when first setting up your account
1. Click on the **eluv.io** logo at top left
1. Click on **Profile**
1. Click on the key icon ![image of key icon](https://eluv-io.github.io/elv-client-js/abr/images/icon_key.png) to reveal your private key (0x… )
1. Double-click on this value and copy
1. **IMPORTANT:** Save in a safe place (a permanent file). Do not share this key. The Content Fabric is designed to be trustless - we do not keep a copy of your key and cannot reset or recover it for you. Until you save a copy of your key somewhere it only exists in your browser's local storage, which can get erased if you choose to wipe your browser history.

<a id="download-and-set-up-the-elv-client-js-library"></a>
### Download and set up the elv-client-js library&nbsp;[&#8673;](#contents)


* If you do not have them already, install **git** and **node.js** / **npm**
* Navigate to the directory where you would like to install **elv-client-js**
	* `git clone https://github.com/eluv-io/elv-client-js`
	* `cd elv-client-js`
	* `npm install`
	* `npm audit fix`
* At this point, you may still see some warnings about package vulnerabilities. As we are only running local command line scripts (rather than using node.js to run a web app that accepts input from the outside world) these are safe to disregard.
* Edit the file **elv-client-js/TestConfiguration.json**
	* To connect to our **demo** network, this file should be set to contain the following:

            {
              "config-url": "https://demov3.net955210.contentfabric.io/config"
            }

	* To connect to our **production** network, the file should be set to contain the following:

            {
              "config-url": "https://main.net955305.contentfabric.io/config"
            }

* Configure the private key environment variable:
	* `export PRIVATE_KEY=0x...` (your Content Fabric private key)
* If your media files are hosted on AWS S3, also set the following environment variables:
	* `export AWS_REGION=` *(your AWS region)*
	* `export AWS_BUCKET=` *(your AWS bucket name)*
	* `export AWS_KEY=AK...` *(your AWS S3 key)*
	* `export AWS_SECRET=...` *(your AWS S3 secret)*

<a id="updating-your-copy-of-elv-client-js"></a>
### Updating your copy of elv-client-js&nbsp;[&#8673;](#contents)

If you need to update to the latest version of elv-client-js, you can do so with:

    cd elv-client-js
    git pull
    npm install

<a id="deprecation-notice"></a>
## DEPRECATION NOTICE&nbsp;[&#8673;](#contents)

This documentation uses scripts in directory `/elv-client-js/testScripts`.

These will eventually be replaced by new scripts in directory `/elv-client-js/utilities`. To minimize disruption to existing customer workflows, the existing `testScripts` directory and its contents will remain for the time being, but deprecation warning messages will be added to the old scripts as corresponding replacements become available.

Differences between old and new scripts are detailed in the following Google doc: 

 * [elv-client-js: The new "/utilities" directory](https://docs.google.com/document/d/1iKQZhea02rVGNg4qI59ig-RyxecUXsJC8KcGhHhrut8/edit?usp=sharing)


<a id="create-a-production-master-object"></a>
## Create a Production Master object&nbsp;[&#8673;](#contents)

The **Production Master** object contains links to your original source material. It is not directly playable, but is used to generate a playable **Mezzanine** object.

To create a Production Master, you will need the following:

* Your Production Master Content Type name or ID
* Your Production Master Library ID
* One or more media files
* (optional) An asset ID (generally your internal ID for a title)  

<a id="get-your-production-master-content-type-name-andor-id"></a>
### Get your Production Master Content Type name and/or ID&nbsp;[&#8673;](#contents)

Each tenant of the Content Fabric has a number **Content Types** created for them. These provide a way of customizing the structure of your fabric objects.

If you click on **Content Types** on the left side you will see a list of these types, among which should be one named "*TENANT_NAME* - Title Master".

If you click on this item, you will see a detail screen where you can select and copy the **Name** and **Object ID** for this Content Type. When you run commands to create Production Masters, you will need to supply either the name or the ID of this content type, e.g.:

 `--type "TENANT_NAME - Title Master"`
 
 or 
 
 `--type iq__...` *(your 'Title Master' content type ID - content type IDs start with "iq__")*

*NOTE: In the instructions below there are a number of operations done via browser. These can be done programmatically as well and we can provide code samples as needed.*

<a id="get-your-production-master-library-id"></a>
### Get your Production Master Library ID&nbsp;[&#8673;](#contents)

Click on **Content** in the left sidebar to get to your list of libraries.

Each tenant also has a number of libraries created for them, including one to hold Production Masters - it should be labeled "*TENANT_NAME* - Title Masters". Click on this item to see a list of objects currently in the library (initially it may be empty).

On the next screen, click on the **Library Info** tab to find the Library ID. When you run commands to create Production Masters, you will need to supply this ID, e.g.:

`--library ilib...` *(your 'Title Masters' library ID - library IDs start with "ilib")*

<a id="create-from-a-file-on-aws-s3"></a>
### Create from a file on AWS S3&nbsp;[&#8673;](#contents)

Here is a sample command line to generate a Production Master using a file on AWS S3. Once you have the required information, substitute it into the sample below (if you do not need to attach an asset ID, you can omit the `--ip-title-id` line):

        cd elv-client-js
        
        node testScripts/CreateProductionMaster.js \
          --library ilib3xDQU7yDgZZQsmMwUrHTwzAEbbdu \
          --title "Big Buck Bunny (master)" \
          --s3-reference \
          --type "TENANT_NAME - Title Master" \
          --ip-title-id "YOUR_INTERNAL_ASSET_ID" \
          --files bbb_sunflower_1080p_60fps_stereo_abl.mp4


**NOTE:** Our convention in this case is to omit the "s3://" prefix and bucket name from the start of file path, i.e. use `bbb_sunflower_1080p_60fps_stereo_abl.mp4` instead of `s3://BUCKET_NAME/bbb_sunflower_1080p_60fps_stereo_abl.mp4`. If the file is in a subdirectory, start with the name of the subdirectory, without any leading slash character (/)



<a id="create-from-a-local-file"></a>
### Create from a local file&nbsp;[&#8673;](#contents)
Here is a sample command line to generate a Production Master using a local file.  Once you have the required information, substitute it into the sample below (if you do not need to attach an asset ID, you can omit the `--ip-title-id` line):

        cd elv-client-js
        
        node testScripts/CreateProductionMaster.js \
          --library ilib3xDQU7yDgZZQsmMwUrHTwzAEbbdu \ 
          --title "Big Buck Bunny (master)" \
          --type "TENANT_NAME - Title Master" \
          --ip-title-id "YOUR_INTERNAL_ASSET_ID" \
          --files PATH_TO_YOUR_DIRECTORY/bbb_sunflower_1080p_60fps_stereo_abl.mp4


<a id="check-output-from-createproductionmaster"></a>
### Check output from CreateProductionMaster.js script&nbsp;[&#8673;](#contents)

When you run the `CreateProductionMaster.js` script, the server examines the file(s) for audio and video streams, then makes a simple guess about what should be included in the mezzanine.

You should see output like the following:

	Creating Production Master
	
	Production Master
	{ done: true, uploadedFiles: 1, totalFiles: 1 }
	
	Production master object created:
	        Object ID: iq__2QEH2nqrLkwZpkNoguw1RGW7hFK4
	        Version Hash: hq__9v2JY21ESnsvNdwWwgJrjiw7jHWv5nXik6quVn6FUgDxbgTgJT8toxBVb1ShZZH4mcFSFcJUJJ

If you included any non-media files in the --files list, you will also see warnings at the end of the output complaining `Failed to create media.Source from file`. These can be ignored as long as you included at least one media file.

If the server did not find a presupplied stereo (2-channel) audio stream among the files, you will see the following warning:

```
WARNING: no audio stream found
```

If the server did not find a video stream among the files, you will see the following warning:

```
WARNING: no video stream found
```

A **Production Master** contains one or more **Variants**. A **Variant** is one version of the original title (this allows you to create different content versions for particular countries or distribution channels). The `CreateProductionMaster.js` script creates a single Variant named `default`.

Clicking on the **Show Metadata** button and drilling down into *production_master* &#8594;  *variants* &#8594;  *default* &#8594;  *streams* will reveal what files and stream indexes the server has chosen to include in this "default" Variant.

<a id="set-viz-mez-browser"></a>
### Set Mezzanine object visibility to 'Viewable' - via browser&nbsp;[&#8673;](#contents)

In order to make the Mezzanine viewable for your site, you must set overall permission level for object to **Viewable**.

From the object details page, click the **Content Info** tab, then change the **Permissions:** line to **Viewable**.

If you cannot change the **Permissions:** line, make sure you are logged in to the Fabric Browser with the private key used to create the mezzanine.

<a id="set-viz-mez-command-line"></a>
### Set Mezzanine object visibility to 'Viewable' - via command line&nbsp;[&#8673;](#contents)

In order to make the Mezzanine viewable using the command line, you will need to know the following:

* The ID of your Mezzanine object (starts with "iq__")

The command to add permissions is then:

    node testScript/ObjectSetPermissions.js \
      --objectId YOUR_OBJECT_ID \
      --value Viewable

<a id="grant-permissions-on-production-master-object---via-browser"></a>
### Grant Group Permissions on Production Master object - via browser&nbsp;[&#8673;](#contents)

In order to let other Content Admins work with your Production Master object, you must grant group permissions to an **Access Group**.

From the object details page, click the blue **Groups** button at top - you should see a screen with the *Access Group* field already chosen for you, set to "*TENANT_NAME* Content Admins".

Check the **Manage** box, then click **Submit**.


<a id="grant-permissions-on-production-master-object---via-command-line"></a>
### Grant Group Permissions on Production Master object - via command line&nbsp;[&#8673;](#contents)

In order to grant group permissions via the command line, you will need to know the following:

* The ID of your Production Master object (starts with "iq__")
* The Address of your "*TENANT_NAME* Content Admins" group (starts with "0x")
* What permission level you would like to grant (for your Content Admins group, choose **manage**)
  * see
  * access
  * manage 

You can find the Address of your group by clicking on the blue **Groups** button at top when you are browsing the details of any object. You can choose a group from the **Access Group** dropdown, then double-click the **Address** field to select it and copy to your clipboard.

The command to add permissions is then:

    node testScripts/AddGroupPermissions.js \
      --objectId YOUR_OBJECT_ID \
      --groupAddress YOUR_GROUP_ADDRESS \
      --permissions manage


<a id="change-streams-on-production-master-variant"></a>
## (If needed) Change streams on Production Master Variant&nbsp;[&#8673;](#contents)

If you need to make any changes to the Variant's stream selections (e.g. because the server did not choose the desired streams, or if you wish to add more audio streams) you can use scripts to add/edit/remove Variant streams. In order to use these scripts, you will need to look at the Production Master's existing stream information.

<a id="display-production-master-stream-info"></a>
### Display Production Master Stream Info&nbsp;[&#8673;](#contents)

You can inspect stream information for files and Variants in the fabric browser by clicking on the **Show Metadata** button and drilling down by clicking on *production_master* &#8594; *sources* &#8594; *(filename)* &#8594; *streams* and   *production_master* &#8594; *variants* &#8594; *(variant name)* &#8594; *streams*. (Clicking on a downward pointing triangle &#9660; will expand all details for a line item, clicking on an expanded line item will collapse it) 

Alternately, you can use the `ProductionMasterInfo.js` script, which will output a subset of this information:

    node testScripts/ProductionMasterInfo.js \
      --libraryId YOUR_LIBRARY_ID  \
      --objectId YOUR_MASTER_OBJECT_ID

<a id="add-stream-to-production-master-variant"></a>
### Add stream to Production Master Variant&nbsp;[&#8673;](#contents)

In order add a stream to a Variant, you will need to supply the following information:

  * The ID of your library that contains your Production Masters (starts with "ilib")
  * The ID of your Production Master object (starts with "iq__")
  * The internal name ("key") for the Variant (usually **"default"**)
  * What internal identifier (called a "stream key") to give your stream. This key can be anything you want, and is not displayed to the end user, but it is recommended to choose something that contains no spaces, uses only letters/numbers/dashes, and describes the media type and purpose, e.g. **audio-french** or **audio-en-surround**. If you must include spaces, then surround the key with quotation marks on the command line.  
  * An externally visible label for the stream. This is what the end user sees in controls to choose audio and/or subtitle streams (see section [Language Codes and Labels](#language-codes-and-labels)). If it contains spaces or punctuation, you must surround with quotation marks, e.g. `"Director's commentary"`.
  * The language code for the stream (see section [Language Codes and Labels](#language-codes-and-labels)).
  * The name of the file in the Production Master that contains the desired stream(s) to use. (An audio stream in your Variant can be created from multiple streams in the original file). This is the filename as it appears in the file list for your Production Master object, and should not contain S3 bucket names or subdirectory prefixes.
  * The stream index(es) to use from the file. Note that stream indexes start at zero, so if your file contains 8 streams and you want to use the last 2, the stream indexes would be 6 and 7. (Use of multiple stream indexes is only valid for audio streams. Video streams in your Variant can only use one stream index from the source file. For audio, currently only a maximum of 2 indexes can be specified, but support for Dolby mixdown is scheduled to be added soon)
  * (Only for audio streams using more than one stream index) The **mapping** to use to combine the source audio streams. Currently only 1 mapping is supported, **2MONO_1STEREO**, which will map the first stream index to the left channel and the second stream index to the right channel.
  * (Only if the stream is the default to use) The flag `--isDefault`. If omitted, the stream is assumed to be an alternate stream and will not be chosen by default unless it is the only stream of its type (audio or subtitle) or if the user has a matching browser/player language preference configured. 

The command to add the stream is then would resemble the following: 

(note that `--mapping`, `SECOND_STREAM_INDEX`, and `--isDefault` would not always be included)
   
    node testScripts/VariantAddStream.js \
      --libraryId YOUR_LIBRARY_ID  \
      --objectId YOUR_MASTER_OBJECT_ID  \
      --variantKey THE_VARIANT_NAME \
      --streamKey YOUR_CHOSEN_STREAM_KEY \
      --file THE_FILENAME \
      --label YOUR_EXTERNALLY_VISIBLE_STREAM_LABEL \
      --language THE_LANGUAGE_CODE \
      --streamIndex FIRST_STREAM_INDEX SECOND_STREAM_INDEX \
      --mapping THE_MAPPING \
      --isDefault

Here is a sample command with example values filled in, for the case where the master source file contains a stereo audio stream:
 
    node testScripts/VariantAddStream.js \
      --libraryId ilib3t4Cf8pdxftVcc4Si35yZxPgN33  \
      --objectId iq__3RVmL1WdnVj7mYrKZcDUPpzstFNU  \
      --variantKey default \
      --streamKey audio-alternate \
      --file MyAlternateAudio.mp4 \
      --label "Director's commentary" \
      --language en \
      --streamIndex 0

Once you run the command, it will output the new **version hash** for the Production Master. You will need this value in order to create a mezzanine, unless you have more streams to add to the Variant, in which case you will need the version hash that is output by your final `VariantAddStream.js` command.


<a id="edit-existing-stream-in-production-master-variant"></a>
### Edit existing stream in Production Master Variant&nbsp;[&#8673;](#contents)

The command to edit a stream is similar to the one for adding a stream. In order edit a stream in a Variant, you will need to supply the following information:

  * The ID of your library that contains your Production Masters (starts with "ilib")
  * The ID of your Production Master object (starts with "iq__")
  * The internal name ("key") for the Variant (usually **"default"**)
  * The internal identifier (called a "stream key") for the stream to edit.  
  * An externally visible label for the stream. This is what the end user sees in controls to choose audio and/or subtitle streams (see section [Language Codes and Labels](#language-codes-and-labels)).  If it contains spaces or punctuation, you must surround with quotation marks, e.g. `"Director's commentary"`.
  * The language code for the stream (see section [Language Codes and Labels](#language-codes-and-labels)).
  * The name of the file in the Production Master that contains the desired stream(s) to use. (An audio stream in your Variant can be created from multiple streams in the original file). This is the filename as it appears in the file list for your Production Master object, and should not contain S3 bucket names or subdirectory prefixes.
  * The stream index(es) to use from the file. Note that stream indexes start at zero, so if your file contains 8 streams and you want to use the last 2, the stream indexes would be 6 and 7. (Use of multiple stream indexes is only valid for audio streams. Video streams in your Variant can only use one stream index from the source file. For audio, currently only a maximum of 2 indexes can be specified, but support for Dolby mixdown is scheduled to be added soon)
  * (Only for audio streams using more than one stream index) The **mapping** to use to combine the source audio streams. Currently only 1 mapping is supported, **2MONO_1STEREO**, which will map the first stream index to the left channel and the second stream index to the right channel.
  * (Only if the stream is the default to use) The flag `--isDefault`. If omitted, the stream is assumed to be an alternate stream and will not be chosen by default unless it is the only stream of its type (audio or subtitle) or if the user has a matching browser/player language preference configured. 

The command to edit the stream is then would resemble the following: 

(note that `--mapping`, `SECOND_STREAM_INDEX`, and `--isDefault` would not always be included)
   
    node testScripts/VariantEditStream.js \
      --libraryId YOUR_LIBRARY_ID  \
      --objectId YOUR_MASTER_OBJECT_ID  \
      --variantKey THE_VARIANT_NAME \
      --streamKey THE_EXISTING_STREAM_KEY \
      --file THE_FILENAME \
      --label YOUR_EXTERNALLY_VISIBLE_STREAM_LABEL \
      --language THE_LANGUAGE_CODE \
      --streamIndex FIRST_STREAM_INDEX SECOND_STREAM_INDEX \
      --mapping THE_MAPPING \
      --isDefault

Here is a sample command with example values filled in, to change the streamIndex from the previous example to 1 instead of zero:
 
    node testScripts/VariantAddStream.js \
      --libraryId ilib3t4Cf8pdxftVcc4Si35yZxPgN33  \
      --objectId iq__3RVmL1WdnVj7mYrKZcDUPpzstFNU  \
      --variantKey default \
      --streamKey audio-alternate \
      --file MyAlternateAudio.mp4 \
      --label "Director's commentary" \
      --language en \
      --streamIndex 1

Once you run the command, it will output the new **version hash** for the Production Master. You will need this value in order to create a mezzanine, unless you have more streams to edit, in which case you will need the version hash that is output by your final `VariantEditStream.js` command.


<a id="remove-existing-stream-from-production-master-variant"></a>
### Remove existing stream from Production Master Variant&nbsp;[&#8673;](#contents)

In order remove a stream from a Variant, you will need to supply the following information:

  * The ID of your library that contains your Production Masters (starts with "ilib")
  * The ID of your Production Master object (starts with "iq__")
  * The internal name ("key") for the Variant (usually **"default"**)
  * The internal identifier (called a "stream key") for the stream to remove.  

The command to edit the stream is then would be the following: 
   
    node testScripts/VariantRemoveStream.js \
      --libraryId YOUR_LIBRARY_ID  \
      --objectId YOUR_MASTER_OBJECT_ID  \
      --variantKey THE_VARIANT_NAME \
      --streamKey THE_EXISTING_STREAM_KEY

Once you run the command, it will output the new **version hash** for the Production Master. You will need this value in order to create a mezzanine, unless you have more streams to remove, in which case you will need the version hash that is output by your final `VariantRemoveStream.js` command.

      
<a id="create-a-mezzanine-object"></a>
## Create a Mezzanine object&nbsp;[&#8673;](#contents)

A **Mezzanine** object contains transcoded media optimized for adaptive bitrate (ABR) streaming. Depending on the ABR profile you choose, it is playable via HLS and/or DASH with DRM (you also have the option to offer playout in the clear).

To create a Mezzanine, you will need the following:

* The Latest Version Hash of your Production Master object (see *"Find the latest version hash for your Production Master"* section below)
* Your Mezzanine Content Type name or ID
* Your Mezzanine Library ID
* A JSON file containing an ABR Profile specifying bit rates, playout formats, and DRM information
* (optional) An asset ID (generally your internal ID for a title)  

*NOTE: In the instructions below there are a number of operations done via browser. These can be done programmatically as well and we can provide code samples as needed.*

<a id="find-the-latest-version-hash-for-your-production-master"></a>
### Find the latest version hash for your Production Master&nbsp;[&#8673;](#contents)

Any script that creates and/or modifies a Production Master will output the new version hash for the object, e.g.: 

```
Adding stream 'audio' to variant 'default'... 
Writing metadata back to object...
Finalizing object...
New version hash: hq__N8VZbpdEtRyTsuPtnczwKNi2hgFNu3F7CJEHmroPqbwEaJNwoL9tiGGLEvi7zm4ZpGmQrntWT
Done.
```

Version hashes always start with the characters `hq__` and this value can be copied and pasted in your command terminal window.

Alternately, you can also look up the version hash in the Fabric Browser and copy from there:

In your browser, if you click on **Content** in the left sidebar, then click on your Title Masters library, you should be able to find your new Production Master object.

(If you are already on the page that lists objects in the library you may need to click the refresh icon ![image for refresh icon](images/icon_reload.png) to see the new object)

Clicking on the object will show you details about the object. For the next step (generating a mezzanine) you will need the **Latest Version Hash** for the object. This value (hq__9v2JY2… for this example) can be copied by clicking on the clipboard icon as shown below. It is also listed in the output from the `CreateProductionMaster.js` script.

![image for copy latest version hash](images/copy_latest_version_hash.png)






<a id="get-your-mezzanine-content-type-name-andor-id"></a>
### Get your Mezzanine Content Type name and/or ID&nbsp;[&#8673;](#contents)

Click on **Content Types** on the left side and click on the one named "*TENANT_NAME* - Title".

You will see a detail screen where you can select and copy the **Name** and **Object ID** for this Content Type. When you run commands to create Mezzanines, you will need to supply either the name or the ID of this content type, e.g.:

 `--type "TENANT_NAME - Title"`
 
 or 
 
 `--type iq__...` *(your 'Title' content type ID - content type IDs start with "iq__")*


<a id="get-your-mezzanine-library-id"></a>
### Get your Mezzanine Library ID&nbsp;[&#8673;](#contents)

Click on **Content** in the left sidebar to get to your list of libraries.

Click on the one labeled "*TENANT_NAME* - Titles", then click on the **Library Info** tab to find the Library ID. When you run commands to create Mezzanines, you will need to supply this ID, e.g.:

`--library ilib...` *(your 'Titles' library ID - library IDs start with "ilib")*

<a id="choose-an-abr-profile"></a>
### Choose an ABR Profile&nbsp;[&#8673;](#contents)

An **ABR Profile** contains information on what formats, resolutions and bitrates to offer for streaming playout, as well as any DRM and/or watermarking information.

There are JSON files containing commonly used profiles in elv-client-js/testScripts/

* `abr_profile_4k_clear_store_encrypted.json`
* `abr_profile_4k_clear_store_unencrypted.json`
* `abr_profile_4k_drm.json`
* `abr_profile_clear_store_encrypted.json`
* `abr_profile_clear_store_unencrypted.json`
* `abr_profile_drm.json`

The 4k files are specifically for offering 16:9 material at 3840x2160 resolution.

For most content we recommend using the `abr_profile_drm.json` file, which contains resolution ladders for a variety of aspect ratios. (For material with 16:9 aspect ratio, this file's top ladder rung is 1920x1080 @ 9.5 mbps)

The `*_clear_*` files are for publishing without DRM. For items that are intended to be publicly accessible, use the profiles that end in `_store_unencrypted.json`. If there is a chance that you might want to change the mezzanine later to have DRM, use the profiles that end in `_store_encrypted.json` (however, these offerings will not be playable to users without a Fabric private key that has been granted access to it).

<a id="create-the-mezzanine-object"></a>
### Create the Mezzanine object&nbsp;[&#8673;](#contents)

Once you have the required information, substitute it into the sample command below (if you do not need to attach an asset ID, you can omit the `--ip-title-id` line):

    node testScripts/CreateABRMezzanine.js --library ilib4JFY7hontNKJJmM4XnZaweTbH9tq \
      --masterHash hq__9v2JY21ESnsvNdwWwgJrjiw7jHWv5nXik6quVn6FUgDxbgTgJT8toxBVb1ShZZH4mcFSFcJUJJ \
      --title "Big Buck Bunny" \
      --type "TENANT_NAME - Title" \
      --ip-title-id "YOUR_INTERNAL_ASSET_ID" \
      --abr-profile testScripts/abr_profile_drm.json


**Note in particular that the `--library` and `--type` parameters will be different from your commands to create Production Masters.**

Once the object is created, transcoding will begin on the server.

<a id="successful-creation-of-mezzanine-object"></a>
### Successful creation of Mezzanine object&nbsp;[&#8673;](#contents)

Your output from the previous command should look something like this:

    Creating ABR Mezzanine...
    Starting Mezzanine Job(s)
    Library ID ilib4JFY7hontNKJJmM4XnZaweTbH9tq
    Object ID iq__4N1gG59cE1YzAL3NfRs39rFVTq8q
    Offering: default
    Write Token: tqw_4SiNg6kktmRGmAjLXjeFzt8s8C2Lbo5Bo
    Write Node: https://host-38-142-50-110.contentfabric.io/

The **Object ID** identifies your new Mezzanine, you will need this value for subsequent commands.

In your browser, if you click on **Content** in the left sidebar, then click on your Titles library, you should see your new Mezzanine object. 
(If you are already on the page that lists objects in the library you may need to click the refresh icon ![image for refresh icon](images/icon_reload.png) to see the new object)

If you go into the "TENANT_NAME - Title Mezzanines" library in your browser you should see the new mezzanine object.


(If you are already on the object list page you may need to click the refresh icon to see the new object)


Drilling down into it, you should see some information about transcoding progress (you will not be able to play it until transcoding has finished and you have finalized the object):

![image for transcoding progress](images/mez_progress.png)

In most cases, the percentage value shown is an average of 2 values (audio percent done and video percent done). The audio generally processes much more quickly, so you will see the value climb quickly to just above 50%, then progress more slowly.

<a id="checking-mezzanine-transcoding-status"></a>
### Checking Mezzanine transcoding status&nbsp;[&#8673;](#contents)

You can get detailed progress info with the following command:

    node testScripts/MezzanineStatus.js --objectId YOUR_NEW_MEZ_OBJECT_ID

Your output should look something like this, listing 2 jobs (1 for audio, 1 for video):

    {
      "63fe3cbf-4660-44b2-8d93-415d97e4bd88": {
        "duration": 485986884811,
        "duration_ms": 485986,
        "progress": {
          "percentage": 68.9119170984456
        },
        "run_state": "running",
        "start": "2020-03-26T18:49:28Z"
      },
      "f39c9de1-4c29-49cf-bcf9-f173bc114e73": {
        "duration": 482414420927,
        "duration_ms": 482414,
        "progress": {
          "percentage": 3.6269430051813467
        },
        "run_state": "running",
        "start": "2020-03-26T18:49:28Z"
      }
    }

The "start" field is in UTC time.

Divide the "duration_ms" field by 1000 to get seconds elapsed.

Depending on the format, bitrate and complexity of the original source material, and the speed of transfer between your S3 bucket and the Content Fabric node, it can take anywhere from 1x to 8x the actual duration of the program to complete transcoding.

Once both jobs show a "run_state" of "finished", you are ready for the next step, finalization.


<a id="finalize-your-mezzanine-object"></a>
## Finalize your Mezzanine object&nbsp;[&#8673;](#contents)

Finalizing the Mezzanine makes the transcoded media available for viewing and distributes it to other nodes in the Content Fabric.

The command to finalize is the same as for checking progress, but with an additional --finalize parameter:

    node testScripts/MezzanineStatus.js --objectId YOUR_NEW_MEZ_OBJECT_ID --finalize

While the command itself should complete quickly, it can take 2-3 minutes for the finalized content to become visible in the browser. (Behind the scenes, the nodes in the fabric are distributing parts among themselves)

In the browser, click the refresh icon ![image for refresh icon](images/icon_reload.png) to update your view, then click on the **Display** tab to see the finalized content.

<a id="grant-permissions-on-mezzanine-object-via-browser"></a>
### Grant Group Permissions on Mezzanine object - via browser&nbsp;[&#8673;](#contents)

(Identical process as for the Production Master object)

From the object details page, click the blue **Groups** button at top - you should see a screen with the *Access Group* field already chosen for you, set to "*TENANT_NAME* Content Admins".

Check the **Manage** box, then click **Submit**.

<a id="grant-permissions-on-mezzanine-object-via-command-line"></a>
### Grant Group Permissions on Mezzanine object - via command line&nbsp;[&#8673;](#contents)

(Identical process as for the Production Master object)

In order to grant group permissions via the command line, you will need to know the following:

* The ID of your Mezzanine object (starts with "iq__")
* The Address of your "*TENANT_NAME* Content Admins" group (starts with "0x")
* What permission level you would like to grant (for your Content Admins group, choose **manage**)
  * see
  * access
  * manage 

You can find the Address of your group by clicking on the blue **Groups** button at top when you are browsing the details of any object. You can choose a group from the **Access Group** dropdown, then double-click the **Address** field to select it and copy to your clipboard.

The command to add permissions is then:

    node testScripts/AddGroupPermissions.js \
      --objectId YOUR_OBJECT_ID \
      --groupAddress YOUR_GROUP_ADDRESS \
      --permissions manage

<a id="adding-captions-to-offering"></a>
## Adding caption stream(s) to an Offering&nbsp;[&#8673;](#contents)

Caption streams are added using .vtt files.

In order to add a caption stream, you will need to know the following:

* The library ID for your Mezzanine object (starts with "ilib")
* The ID of your Mezzanine object (starts with "iq__")
* The Offering you wish to add captions to (usually "default")
* The path to your .vtt file
* Whether or not the captions are *forced* (most caption sets are not - Netflix has a good overview of the topic here:  [ 
Understanding Forced Narrative Subtitles]([forced](https://partnerhelp.netflixstudios.com/hc/en-us/articles/217558918-Understanding-Forced-Narrative-Subtitles)))
 * In general, a 'forced' subtitle stream will require that the mezzanine ALSO has an audio stream with the SAME language code - otherwise, the player will never use that subtitle stream.
 * For example, if you are adding a forced caption set for English (lang code `en`) then the offering must also contain an audio stream with lang code `en`.
 * Note that this causes a problem for Chinese, which has different language codes for spoken vs. written language - for 'forced' Chinese captions, use the audio language code (`yue` or `cmn`) rather than the text language code (`zh-hans` or `zh-hant`). If your offering contains both Mandarin (`cmn`) and Cantonese (`yue`) audio streams then you will need to add your Chinese forced caption file twice, once using `cmn` and once using `yue`.
 * NON-forced Chinese captions should still use the appropriate text language codes (`zh-hans` or `zh-hant`).
* The language code for your captions (see section [Language Codes and Labels](#language-codes-and-labels)). If the captions are 'forced' and in Chinese, see previous major bullet point above about what language code to use.
* A label to show in the player UI for your captions
 * If you wish to set a label in the same language as the subtitles, copy and paste from section [Language Codes and Labels](#language-codes-and-labels).
 * If the captions are forced, they are not supposed to be shown as an option in player UIs, but it is still good to set a label like "English (forced)" so that if a player mistakenly lists it as an option it will be apparent what is happening.
* Whether or not you would like to store the captions in encrypted format on server (default false)
* Whether to use as the default caption stream
* Whether to adjust all caption timestamps by a fixed number of seconds (positive or negative)

Sample command with minimal options:

        cd elv-client-js
        
        node testScripts/OfferingAddCaptionStream.js \
          --libraryId YOUR_MEZ_LIB_ID \
          --objectId YOUR_MEZ_OBJECT_ID \
          --lang "YOUR_LANGUAGE_CODE" \
          --label "YOUR_LABEL_FOR_PLAYER_UI" \
          --file PATH_TO_YOUR_VTT_FILE

Add the following optional parameters above the `--file` line if desired:

 * add the caption stream to an Offering other than 'default': `--offeringKey THE_OFFERING_KEY \`
 * make this the default caption stream: `--isDefault \`
 * mark these captions as *forced*: `--forced \`
 * store the captions in encrypted format on server: `--encrypt \`
 * add a fixed number seconds to all timestamps: `--timeShift NUMBER_OF_SECONDS \`
 * subtract a fixed number seconds from all timestamps: `--timeShift -NUMBER_OF_SECONDS \`
 * specify the stream key used internally in metadata to refer to caption stream: `--streamKey DESIRED_STREAM_KEY \`

<a id="grant-permissions-on-mezzanine-object-via-browser"></a>
### Grant Group Permissions on Mezzanine object - via browser&nbsp;[&#8673;](#contents)

(Identical process as for the Production Master object)

From the object details page, click the blue **Groups** button at top - you should see a screen with the *Access Group* field already chosen for you, set to "*TENANT_NAME* Content Admins".

Check the **Manage** box, then click **Submit**.

<a id="grant-permissions-on-mezzanine-object-via-command-line"></a>
### Grant Group Permissions on Mezzanine object - via command line&nbsp;[&#8673;](#contents)

(Identical process as for the Production Master object)

In order to grant group permissions via the command line, you will need to know the following:

* The ID of your Mezzanine object (starts with "iq__")
* The Address of your "*TENANT_NAME* Content Admins" group (starts with "0x")
* What permission level you would like to grant (for your Content Admins group, choose **manage**)
  * see
  * access
  * manage 

You can find the Address of your group by clicking on the blue **Groups** button at top when you are browsing the details of any object. You can choose a group from the **Access Group** dropdown, then double-click the **Address** field to select it and copy to your clipboard.

The command to add permissions is then:

    node testScripts/AddGroupPermissions.js \
      --objectId YOUR_OBJECT_ID \
      --groupAddress YOUR_GROUP_ADDRESS \
      --permissions manage

<a id="duplicating-an-existing-offering"></a>
## Duplicating an existing Offering&nbsp;[&#8673;](#contents)

A **Mezzanine** object contains one or more **Offerings**. Each **Offering** specifies the following information:

* Original media (which Production Master, and which Variant within)
* Playout format (DASH and/or HLS)
* Bitrates and resolutions
* DRM (FairPlay / PlayReady / Widevine / AES-128 / SAMPLE-AES)
* Which media streams to offer (e.g. if your Production Master Variant has more than one audio stream)
* Watermark (text or image)
* Trimming (entry and exit points)

When the `CreateABRMezzanine.js` script is run, it creates a single **Offering** named `default`.

The `OfferingCopy.js` script allows you to duplicate an existing Offering, after which you can modify the copy to change the playout options (see *"Adding / removing playout options from an Offering"* section below):

    node testScripts/OfferingCopy.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey default \
      --targetOfferingKey YOUR_NEW_OFFERING_NAME

(if you want to copy an Offering other than the one named `default` then change the end of the `--offeringKey` line)

<a id="viewing-offerings-other-than-default"></a>
### Viewing Offerings other than "default"&nbsp;[&#8673;](#contents)

In the Fabric Browser, when you are on the **Display** tab for your Mezzanine, click on the **Advanced Controls** button to access additional options. The **Offering** pulldown menu will allow you to choose other Offerings besides "default".

<a id="adding--removing-playout-options-from-an-offering"></a>
## Adding / removing playout options from an Offering&nbsp;[&#8673;](#contents)

You can make changes to an Offering (either the `default`, or one you have created via the `OfferingCopy.js` script) to modify playout options.

<a id="adding-clear-drm-free-playout-option"></a>
### Adding Clear (DRM-free) playout option&nbsp;[&#8673;](#contents)

The `OfferingAddClear.js` script will add a DRM-free playout option to one Offering within your Mezzanine:

    node testScripts/OfferingAddClear.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME

<a id="removing-clear-drm-free-playout-option"></a>
### Removing Clear (DRM-free) playout option&nbsp;[&#8673;](#contents)

The `OfferingRemoveClear.js` script will remove DRM-free playout options from one Offering within your Mezzanine:

    node testScripts/OfferingRemoveClear.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME


<a id="removing-drm-playout-option"></a>
### Removing DRM playout option&nbsp;[&#8673;](#contents)

The `OfferingRemoveDRM.js` script will remove DRM-protected playout options from one Offering within your Mezzanine:

    node testScripts/OfferingRemoveDRM.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME

<a id="displaying-the-resolution-ladder-for-an-offering"></a>
### Displaying the resolution ladder for an Offering&nbsp;[&#8673;](#contents)

The `OfferingListRungs.js` script will display the resolution ladder for an existing Offering:

    node testScripts/OfferingListRungs.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME

If `--offeringKey` is omitted then `default` will be assumed.

Sample output:

    Listing resolution ladder rungs for all streams in offering 'default'
    {
      "audio": {
        "representations": {
          "audio@128000": {
            "bit_rate": 128000,
            "media_struct_stream_key": "audio",
            "type": "RepAudio"
          }
        }
      },
      "video": {
        "representations": {
          "video_1452x1080@4900000": {
            "bit_rate": 4900000,
            "crf": 0,
            "height": 1080,
            "media_struct_stream_key": "video",
            "type": "RepVideo",
            "width": 1452
          }
          "video_726x540@1500000": {
            "bit_rate": 1500000,
            "crf": 0,
            "height": 540,
            "media_struct_stream_key": "video",
            "type": "RepVideo",
            "width": 726
          },
          "video_968x720@3375000": {
            "bit_rate": 3375000,
            "crf": 0,
            "height": 720,
            "media_struct_stream_key": "video",
            "type": "RepVideo",
            "width": 968
          }
        }
      }
    }

<a id="adding-a-rung-to-an-offerings-video-playout-resolution-ladder"></a>
### Adding a rung to an Offering's video playout resolution ladder&nbsp;[&#8673;](#contents)

The `OfferingAddVideoRung.js` script will allow you to add a new rung to an Offering's video resolution ladder:

    node testScripts/OfferingAddVideoRung.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME \
      --width THE_NEW_WIDTH \ 
      --height THE_NEW_HEIGHT \
      --bitrate THE_NEW_BITRATE

If you omit `--offeringKey` then `default` will be assumed.

Optionally, the `--width`  and/or `--bitrate` options can be omitted, and the script will scale the existing top rung based on `--height`.
      
Note that if you supply both `--width` and `--height` but the resulting aspect ratio would differ more than 5% from the existing top rung's aspect ratio the script will halt with an error. If you would like to add anyway, add `--ignoreAspectRatio` to the command.

Note also that only *lower quality* rungs can be added to an existing Offering. The new rung's bitrate must be lower than the existing top rung, and height and width must be less than or equal to the existing top rung. 

For example, if your top rung is 1920x1080 @ 9,500,000 bps:

* OK:
  * 1920x1080 @ 7,000,000 bps 
  * 1280x720 @ 7,000,000 bps 
* Not OK:
  * 1920x1080 @ 12,000,000 bps (bitrate must be less than top rung)
  * 3840x2160 @ 7,000,000 bps (height and width must be equal to or smaller than top rung)
  * 1280x720 @ 9,500,000 bps (bitrate must be less than top rung)
 
 Note that in special cases, your Offering's video stream may not be named `video` - if this is the case, use `--streamKey STREAM_NAME` to specify the actual name of the stream. (You can use the `OfferingListRungs.js` script to see the names of your Offering's streams)
 
<a id="removing-a-rung-from-an-offerings-video-playout-resolution-ladder"></a>
### Removing a rung from an Offering's video playout resolution ladder&nbsp;[&#8673;](#contents)

The `OfferingRemoveVideoRung.js` script will allow you to remove an existing rung from an Offering's video resolution ladder:

    node testScripts/OfferingRemoveVideoRung.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME \
      --rungKey THE_RUNG_NAME

If you omit `--offeringKey` then `default` will be assumed.

To look up the value of `--rungKey`, use the `OfferingListRungs.js` script (see above). Video rungs are generally named "video_*WIDTH*x*HEIGHT*@*BITRATE*", e.g.: `video_1280x720@4500000`, but this is not guaranteed - use the `OfferingListRungs.js` script to show all the rung names.

You are not allowed to remove the top rung from the ladder, if you try the script will halt with an error.

Note that in special cases, your Offering's video stream may not be named `video` - if this is the case, use `--streamKey STREAM_NAME` to specify the actual name of the stream. (You can use the `OfferingListRungs.js` script to see the names of your Offering's streams)

<a id="example-scenarios"></a>
## Example Scenarios&nbsp;[&#8673;](#contents)

<a id="adding-a-stereo-stream-created-from-2-mono-streams-to-a-production-master-variant"></a>
### Adding a stereo stream created from 2 mono streams to a Production Master Variant&nbsp;[&#8673;](#contents)

In the case where the source has left and right audio stored individually as mono streams, adding a stereo stream requires using the `VariantAddStream.js` script and specifying the stream indexes to use, as well as the mapping type **2MONO_1STEREO**.

For example, The following assumes that your source audio streams are in file 'MyMovie.mp4', at stream indexes 1 and 2, is English, and should be the default audio choice.

    node testScripts/VariantAddStream.js \
      --libraryId ilib3t4Cf8pdxftVcc4Si35yZxPgN33  \
      --objectId iq__3RVmL1WdnVj7mYrKZcDUPpzstFNU  \
      --variantKey default \
      --streamKey audio \
      --file MyMovie.mp4 \
      --label English \
      --language en \
      --streamIndex 1 2 \
      --mapping 2MONO_1STEREO \
      --isDefault


For more detailed info on the individual options, please see [Add stream to Production Master Variant](#add-stream-to-production-master-variant) 


<a id="adding-a-stereo-stream-created-from-a-single-mono-stream-to-a-production-master-variant"></a>
### Adding a stereo stream created from a single mono stream to a Production Master Variant&nbsp;[&#8673;](#contents)

In the case where the source only has a single mono stream, adding a stereo stream is similar to the case where you have 2 mono channels (above), except that you would specify the same source stream index twice.

For example, The following assumes that your source audio stream is in file 'MyMovie.mp4', has stream index 1, is English, and should be the default audio choice.

    node testScripts/VariantAddStream.js \
      --libraryId ilib3t4Cf8pdxftVcc4Si35yZxPgN33  \
      --objectId iq__3RVmL1WdnVj7mYrKZcDUPpzstFNU  \
      --variantKey default \
      --streamKey audio \
      --file MyMovie.mp4 \
      --label English \
      --language en \
      --streamIndex 1 1 \
      --mapping 2MONO_1STEREO \
      --isDefault

For more detailed info on the individual options, please see [Add stream to Production Master Variant](#add-stream-to-production-master-variant) 


<a id="adding-a-clear-playout-offering-to-a-drm-protected-mezzanine"></a>
### Adding a 'clear playout' Offering to a DRM-protected Mezzanine&nbsp;[&#8673;](#contents)

The following assumes that you created your Mezzanine using the `abr_profile_drm.json` profile, which will result in a `default` Offering that only offers DRM playback:

     node testScripts/OfferingCopy.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey default \
      --targetOfferingKey clear-playout

    node testScripts/OfferingAddClear.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey clear-playout
      
    node testScripts/OfferingRemoveDRM.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey clear-playout      
      
After running the above commands, you will have an additional `clear-playout` Offering that has only DRM-free playout options.


<a id="language-codes-and-labels"></a>
## Language Codes and Labels&nbsp;[&#8673;](#contents)

Below is a table of codes and labels for some of the most commonly encountered languages. To look up a language not on this list, visit the [IANA Language Subtag Registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)

Note that some references may capitalize letters appearing after a dash, e.g. "pt-BR" instead of "pt-br". 

<table dir="ltr">
    <thead>
    <tr>
        <th>language</th>
        <th>code</th>
        <th>label</th>
        <th>note</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Arabic</td>
        <td>ar</td>
        <td dir="rtl">اَلْعَرَبِيَّةُ</td>
        <td></td>
    </tr>
    <tr>
        <td>Bangla / Bengali</td>
        <td>bn</td>
        <td>বাংলা</td>
        <td></td>
    </tr>
    <tr>
        <td>Chinese (Cantonese)</td>
        <td>yue</td>
        <td>廣東話</td>
        <td>(spoken) for audio streams only</td>
    </tr>
    <tr>
        <td>Chinese (Mandarin)</td>
        <td>cmn</td>
        <td>普通话</td>
        <td>(spoken) for audio streams only</td>
    </tr>
    <tr>
        <td>Chinese (Simplified)</td>
        <td>zh-hans</td>
        <td>简体中文</td>
        <td>(written) for text streams only</td>
    </tr>
    <tr>
        <td>Chinese (Traditional)</td>
        <td>zh-hant</td>
        <td>繁體中文</td>
        <td>(written) for text streams only</td>
    </tr>
    <tr>
        <td>Danish</td>
        <td>da</td>
        <td>Dansk</td>
        <td></td>
    </tr>
    <tr>
        <td>Dutch</td>
        <td>nl</td>
        <td>Nederlands</td>
        <td></td>
    </tr>
    <tr>
        <td>Dutch (Netherlands)</td>
        <td>nl-nl</td>
        <td>Nederlands</td>
        <td>specifically as spoken/written in the Netherlands</td>
    </tr>
    <tr>
        <td>English</td>
        <td>en</td>
        <td>English</td>
        <td></td>
    </tr>
    <tr>
        <td>English</td>
        <td>en-gb</td>
        <td>English (United Kingdom)</td>
        <td>specifically as spoken/written in the United Kingdom</td>
    </tr>
    <tr>
        <td>English</td>
        <td>en</td>
        <td>English</td>
        <td></td>
    </tr>
    <tr>
        <td>Finnish</td>
        <td>fi</td>
        <td>Suomi</td>
        <td></td>
    </tr>
    <tr>
        <td>French</td>
        <td>fr</td>
        <td>Français</td>
        <td></td>
    </tr>
    <tr>
        <td>French (Parisian)</td>
        <td>fr-fr</td>
        <td>Français</td>
        <td>specifically as spoken/written in France</td>
    </tr>
    <tr>
        <td>German</td>
        <td>de</td>
        <td>Deutsch</td>
        <td></td>
    </tr>
    <tr>
        <td>German (Germany)</td>
        <td>de-de</td>
        <td>Deutsch (Deutschland)</td>
        <td>specifically as spoken/written in Germany</td>
    </tr>
    <tr>
        <td>Hebrew</td>
        <td>he</td>
        <td dir="rtl">עִבְרִית</td>
        <td></td>
    </tr>
    <tr>
        <td>Hindi</td>
        <td>hi</td>
        <td>हिन्दी</td>
        <td></td>
    </tr>
    <tr>
        <td>Indonesian</td>
        <td>id</td>
        <td>Bahasa Indonesia</td>
        <td></td>
    </tr>
    <tr>
        <td>Italian</td>
        <td>it</td>
        <td>Italiano</td>
        <td></td>
    </tr>
    <tr>
        <td>Japanese</td>
        <td>ja</td>
        <td>日本語</td>
        <td></td>
    </tr>
    <tr>
        <td>Korean</td>
        <td>ko</td>
        <td>한국어</td>
        <td></td>
    </tr>
    <tr>
        <td>Marathi</td>
        <td>mr</td>
        <td>मराठी</td>
        <td></td>
    </tr>
    <tr>
        <td>Norwegian</td>
        <td>no</td>
        <td>Norsk</td>
        <td></td>
    </tr>
    <tr>
        <td>Polish</td>
        <td>pl</td>
        <td>Polski</td>
        <td></td>
    </tr>
    <tr>
        <td>Portuguese</td>
        <td>pt</td>
        <td>Português</td>
        <td></td>
    </tr>
    <tr>
        <td>Portuguese (Brazil)</td>
        <td>pt-br</td>
        <td>Português (Brasil)</td>
        <td>specifically as spoken/written in Brazil</td>
    </tr>
    <tr>
        <td>Russian</td>
        <td>ru</td>
        <td>Русский</td>
        <td></td>
    </tr>
    <tr>
        <td>Spanish (Castilian)</td>
        <td>es</td>
        <td>Español</td>
        <td>specifically as spoken/written in Spain</td>
    </tr>
    <tr>
        <td>Spanish (Latin America)</td>
        <td>es-419</td>
        <td>Español (Latinoamericano)</td>
        <td>specifically as spoken/written in Latin America</td>
    </tr>
    <tr>
        <td>Swedish</td>
        <td>sv</td>
        <td>Svenska</td>
        <td></td>
    </tr>
    <tr>
        <td>Telugu</td>
        <td>te</td>
        <td>తెలుగు</td>
        <td></td>
    </tr>
    <tr>
        <td>Thai</td>
        <td>th</td>
        <td>ภาษาไทย</td>
        <td></td>
    </tr>
    <tr>
        <td>Turkish</td>
        <td>tr</td>
        <td>Türkçe</td>
        <td></td>
    </tr>
    </tbody>
</table>
