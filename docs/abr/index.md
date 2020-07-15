# Eluvio Content Fabric: Sample Commands for Master File and IMF ingest

*last revised: 2020-07-15*


In the instructions below there are a number of operations done via browser. These can be done programmatically as well and we can provide code samples as needed.


## Preparation


### Find your Content Fabric private key and record it in a safe place:


1. Navigate to the Content Fabric Browser page
	* 	If you have been set up on our **demo** network, go to: [https://core.demov3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/](https://core.demov3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/)
	* 	If you have been set up on our **production** network, go to:
[https://core.v3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/](https://core.demov3.contentfabric.io/#/apps/Eluvio%20Fabric%20Browser/#/)
1. Enter the password you chose when first setting up your account
1. Click on the **eluv.io** logo at top left
1. Click on **Profile**
1. Click on the key icon ![image of key icon](https://eluv-io.github.io/elv-client-js/abr/images/icon_key.png) to reveal your private key (0x… )
1. Double-click on this value and copy
1. **IMPORTANT:** Save in a safe place (a permanent file). Do not share this key. The Content Fabric is designed to be trustless - we do not keep a copy of your key and cannot reset or recover it for you. Until you save a copy of your key somewhere it only exists in your browser's local storage, which can get erased if you choose to wipe your browser history.

### Download and set up the elv-client-js library:


* If you do not have them already, install **git** and **node.js** / **npm**
* Navigate to the directory where you would like to install **elv-client-js**
	* `git clone https://github.com/eluv-io/elv-client-js`
	* `cd elv-client-js`
	* `git checkout develop`
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
              "config-url": "https://host-66-220-3-85.contentfabric.io/config/config"
            }

* Configure the private key environment variable:
	* `export PRIVATE_KEY=0x...` (your Content Fabric private key)
* If your media files are hosted on AWS S3, also set the following environment variables:
	* `export AWS_REGION=` *(your AWS region)*
	* `export AWS_BUCKET=` *(your AWS bucket name)*
	* `export AWS_KEY=AK...` *(your AWS S3 key)*
	* `export AWS_SECRET=...` *(your AWS S3 secret)*


## Updating your copy of elv-client-js

If you need to update to the latest version of elv-client-js, you can do so with:

    cd elv-client-js
    git pull
    npm install


## Creating a Production Master object

The **Production Master** object contains links to your original source material. It is not directly playable, but is used to generate a playable **Mezzanine** object.

To create a Production Master, you will need the following:

* Your Production Master Content Type name or ID
* Your Production Master Library ID
* One or more media files
* (optional) An asset ID (generally your internal ID for a title)  

### Get your Production Master Content Type name and/or ID

Each tenant of the Content Fabric has a number **Content Types** created for them. These provide a way of customizing the structure of your fabric objects.

If you click on **Content Types** on the left side you will see a list of these types, among which should be one named "*COMPANY_NAME* - Title Master".

If you click on this item, you will see a detail screen where you can select and copy the **Name** and **Object ID** for this Content Type. When you run commands to create Production Masters, you will need to supply either the name or the ID of this content type, e.g.:

 `--type "YOUR_COMPANY_NAME - Title Master"`
 
 or 
 
 `--type iq__...` *(your 'Title Master' content type ID - content type IDs start with "iq__")*


### Get your Production Master Library ID

Click on **Content** in the left sidebar to get to your list of libraries.

Each tenant also has a number of libraries created for them, including one to hold Production Masters - it should be labeled "*COMPANY_NAME* - Title Masters". Click on this item to see a list of objects currently in the library (initially it may be empty).

On the next screen, click on the **Library Info** tab to find the Library ID. When you run commands to create Production Masters, you will need to supply this ID, e.g.:

`--library ilib...` *(your 'Title Masters' library ID - library IDs start with "ilib")*

### Creating from a file on AWS S3

Here is a sample command line to generate a Production Master using a file on AWS S3. Once you have the required information, substitute it into the sample below (if you do not need to attach an asset ID, you can omit the `--ip-title-id` line):

        cd elv-client-js
        
        node testScripts/CreateProductionMaster.js \
          --library ilib3xDQU7yDgZZQsmMwUrHTwzAEbbdu \
          --title "Big Buck Bunny (master)" \
          --s3-reference \
          --type "YourCompanyName - Title Master" \
          --ip-title-id "YOUR_INTERNAL_ASSET_ID" \
          --files bbb_sunflower_1080p_60fps_stereo_abl.mp4


**NOTE:** Our convention in this case is to omit the "s3://" prefix and bucket name from the start of file path, i.e. use `bbb_sunflower_1080p_60fps_stereo_abl.mp4` instead of `s3://BUCKET_NAME/bbb_sunflower_1080p_60fps_stereo_abl.mp4`. If the file is in a subdirectory, start with the name of the subdirectory, without any leading slash character (/)


### Creating from a local file
Here is a sample command line to generate a Production Master using a local file.  Once you have the required information, substitute it into the sample below (if you do not need to attach an asset ID, you can omit the `--ip-title-id` line):

        cd elv-client-js
        
        node testScripts/CreateProductionMaster.js \
          --library ilib3xDQU7yDgZZQsmMwUrHTwzAEbbdu \ 
          --title "Big Buck Bunny (master)" \
          --type "MyCompanyName - Title Master" \
          --ip-title-id "YOUR_INTERNAL_ASSET_ID" \
          --files PATH_TO_YOUR_DIRECTORY/bbb_sunflower_1080p_60fps_stereo_abl.mp4


### Successful creation of Production Master object

When you run the `CreateProductionMaster.js` script, the server examines the file(s) for audio and video streams, then makes a best guess about what should be included in the mezzanine.

You should see output like the following:

	Creating Production Master
	
	Production Master
	{ done: true, uploadedFiles: 1, totalFiles: 1 }
	
	Production master object created:
	        Object ID: iq__2QEH2nqrLkwZpkNoguw1RGW7hFK4
	        Version Hash: hq__9v2JY21ESnsvNdwWwgJrjiw7jHWv5nXik6quVn6FUgDxbgTgJT8toxBVb1ShZZH4mcFSFcJUJJ

If you included any non-media files in the --files list, you will also see warnings at the end of the output complaining `Failed to create media.Source from file`. These can be ignored as long as you included at least one media file.

In your browser, if you click on **Content** in the left sidebar, then click on your Title Masters library, you should see your new Production Master object.

(If you are already on the page that lists objects in the library you may need to click the refresh icon ![image for refresh icon](images/icon_reload.png) to see the new object)

Clicking on the object will show you details about the object. For the next step (generating a mezzanine) you will need the **Latest Version Hash** for the object. This value (hq__9v2JY2… for this example) can be copied by clicking on the clipboard icon as shown below. It is also listed in the output from the `CreateProductionMaster.js` script.

![image for copy latest version hash](images/copy_latest_version_hash.png)

A **Production Master** contains one or more **Variants**. A **Variant** is one version of the original title (this allows you to create different content versions for particular countries or distribution channels). The `CreateProductionMaster.js` script creates a single Variant named `default`.

Clicking on the **Show Metadata** button and drilling down into *production_master* → *variants* → *default* → *streams* will reveal what files and stream indexes the server has chosen to include in this "default" Variant.

### Grant Permissions on Production Master object - via browser

In order to let other users work with your object, you must grant permissions to an **Access Group**.

From the object details page, click the blue **Groups** button at top - you should see a screen with the *Access Group* field already chosen for you, set to "*COMPANY_NAME* Content Admins".

Check all 3 boxes (**See**, **Access**, and **Manage**), then click **Submit**.


### Grant Permissions on Production Master object - via command line

In order to grant permissions via the command line, you will need to know the following:

* The ID of your Production Master object (starts with "iq__")
* The Address of your "*COMPANY_NAME* Content Admins" group (starts with "0x")

You can find the Address of your group by clicking on the blue **Groups** button at top when you are browsing the details of any object. You can choose a group from the **Access Group** dropdown, then double-click the **Address** field to select it and copy to your clipboard.

The command to add permissions is then:

    node testScripts/AddGroupPermissions.js \
      --objectId YOUR_OBJECT_ID \
      --groupAddress YOUR_GROUP_ADDRESS \
      --permissions see access manage

## Creating a Mezzanine object

A **Mezzanine** object contains transcoded media optimized for adjustable bitrate (ABR) streaming. Depending on the ABR profile you choose, it is playable via HLS and/or DASH with DRM (you also have the option to offer playout in the clear).

To create a Mezzanine, you will need the following:

* Your Mezzanine Content Type name or ID
* Your Mezzanine Library ID
* The Latest Version Hash of your Production Master object (see *"Successful creation of Production Master object"* section above)
* A JSON file containing an ABR Profile specifying bit rates, playout formats, and DRM information
* (optional) An asset ID (generally your internal ID for a title)  

### Get your Mezzanine Content Type name and/or ID

Click on **Content Types** on the left side and click on the one named "*COMPANY_NAME* - Title".

You will see a detail screen where you can select and copy the **Name** and **Object ID** for this Content Type. When you run commands to create Mezzanines, you will need to supply either the name or the ID of this content type, e.g.:

 `--type "YOUR_COMPANY_NAME - Title"`
 
 or 
 
 `--type iq__...` *(your 'Title' content type ID - content type IDs start with "iq__")*


### Get your Mezzanine Library ID

Click on **Content** in the left sidebar to get to your list of libraries.

Click on the one labeled "*COMPANY_NAME* - Titles", then click on the **Library Info** tab to find the Library ID. When you run commands to create Mezzanines, you will need to supply this ID, e.g.:

`--library ilib...` *(your 'Titles' library ID - library IDs start with "ilib")*

### Choose an ABR Profile

An **ABR Profile** contains information on what formats, resolutions and bitrates to offer for streaming playout, as well as any DRM and/or watermarking information.

There are JSON files containing commonly used profiles in elv-client-js/testScripts/

* abr_profile_4k_clear.json
* abr_profile_4k_drm.json
* abr_profile_clear.json
* abr_profile_drm.json

The 4k files are specifically for offering 16:9 material at 3840x2160 resolution.

For most content we recommend using the abr_profile_drm.json file, which contains resolution ladders for a variety of aspect ratios. (For material with 16:9 aspect ratio, this file's top ladder rung is 1920x1080 @ 9.5 mbps)

The *_clear files are for publishing without DRM.

### Create the Mezzanine object

Once you have the required information, substitute it into the sample command below (if you do not need to attach an asset ID, you can omit the `--ip-title-id` line):

    node testScripts/CreateABRMezzanine.js --library ilib4JFY7hontNKJJmM4XnZaweTbH9tq \
      --masterHash hq__9v2JY21ESnsvNdwWwgJrjiw7jHWv5nXik6quVn6FUgDxbgTgJT8toxBVb1ShZZH4mcFSFcJUJJ \
      --title "Big Buck Bunny" \
      --type "COMPANY_NAME - Title" \
      --ip-title-id "YOUR_INTERNAL_ASSET_ID" \
      --abr-profile testScripts/abr_profile_drm.json


**Note in particular that the `--library` and `--type` parameters will be different from your commands to create Production Masters.**

Once the object is created, transcoding will begin on the server.

### Successful creation of Mezzanine object

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

If you go into the "COMPANY_NAME - Title Mezzanines" library in your browser you should see the new mezzanine object.


(If you are already on the object list page you may need to click the refresh icon to see the new object)


Drilling down into it, you should see some information about transcoding progress (you will not be able to play it until transcoding has finished and you have finalized the object):

![image for transcoding progress](images/mez_progress.png)

In most cases, the percentage value shown is an average of 2 values (audio percent done and video percent done). The audio generally processes much more quickly, so you will see the value climb quickly to just above 50%, then progress more slowly.

### Checking Mezzanine transcoding status

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

## Finalizing your Mezzanine object

Finalizing the Mezzanine makes the transcoded media available for viewing and distributes it to other nodes in the Content Fabric.

The command to finalize is the same as for checking progress, but with an additional --finalize parameter:

    node testScripts/MezzanineStatus.js --objectId YOUR_NEW_MEZ_OBJECT_ID --finalize

While the command itself should complete quickly, it can take 2-3 minutes for the finalized content to become visible in the browser. (Behind the scenes, the nodes in the fabric are distributing parts among themselves)

In the browser, click the refresh icon ![image for refresh icon](images/icon_reload.png) to update your view, then click on the **Display** tab to see the finalized content.

### Grant Permissions on Mezzanine object

(Identical process as for the Production Master object)

From the object details page, click the blue **Groups** button at top - you should see a screen with the *Access Group* field already chosen for you, set to "*COMPANY_NAME* Content Admins".

Check all 3 boxes (**See**, **Access**, and **Manage**), then click **Submit**.


## Adding another Offering to a Mezzanine object

A **Mezzanine** object contains one or more **Offerings**. Each **Offering** specifies the following information:

* Original media (which Production Master, and which Variant within)
* Playout format (DASH and/or HLS)
* Bitrates and resolutions
* DRM (Widevine / AES)
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

### Viewing Offerings other than "default"

In the Fabric Browser, when you are on the **Display** tab for your Mezzanine, click on the **Advanced Controls** button to access additional options. The **Offering** pulldown menu will allow you to choose other Offerings besides "default".

## Adding / removing playout options from an Offering

You can make changes to an Offering (either the `default`, or one you have created via the `OfferingCopy.js` script) to modify playout options.

### Adding Clear (DRM-free) playout option

The `OfferingAddClear.js` script will add a DRM-free playout option to one Offering within your Mezzanine:

    node testScripts/OfferingAddClear.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME

### Removing Clear (DRM-free) playout option

The `OfferingRemoveClear.js` script will remove DRM-free playout options from one Offering within your Mezzanine:

    node testScripts/OfferingRemoveClear.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME


### Removing DRM playout option

The `OfferingRemoveDRM.js` script will remove DRM-protected playout options from one Offering within your Mezzanine:

    node testScripts/OfferingRemoveDRM.js \
      --libraryId YOUR_TITLE_LIBRARY_ID \
      --objectId YOUR_MEZ_OBJECT_ID \
      --offeringKey THE_OFFERING_NAME


## Example Scenario: Adding a 'clear playout' Offering to a DRM-protected Mezzanine

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