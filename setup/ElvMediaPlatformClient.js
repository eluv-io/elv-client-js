/* eslint-disable no-unused-vars */

const AdmgrCommercialOffering = require("../src/contracts/AdmgrCommercialOffering");

class ElvMediaPlatform {

  /*
 * Set all the special metadata and contract attributes of the commercial offering.
 * Requires a write-open content object of type 'commercial_offering'.
 */
  static async SetCommercialOffering({
    client,
    emp,
    libraryId,
    objectId,
    writeToken,
    campaignManager, mandatorySponsoring,
    presetAccessCharge, mandatoryPresetAccessCharge
  }) {

    var md = {
      campaign_manager: campaignManager,
      mandatory_sponsoring: mandatorySponsoring,
      preset_access_charge: presetAccessCharge,
      mandatory_preset_access_charge: mandatoryPresetAccessCharge,
      data_model_version: 1
    };

    const customContract = client.CustomContractAddress({
      libraryId: libraryId,
      objectId: objectId});

    if (campaignManager != "") {
    // Find campain manager's library ID
      const campaignManagerMeta = await client.ContentObjectMetadata({
        libraryId: emp.ads_marketplace,
        objectId: campaignManager
      });

      const campaignManagerLib = campaignManagerMeta.campaigns_library;

      const campaignLibMeta = await client.PublicLibraryMetadata({
        libraryId: campaignManagerLib
      });
      md.campaign_manager_library_id = campaignLibMeta.campaign_manager_libraryId;
      md.campaign_manager_object_id = campaignLibMeta.campaign_manager_objectId;
      md.campaign_manager_address = client.utils.HashToAddress(campaignLibMeta.campaign_manager_objectId);

      await client.CallContractMethod({
        contractAddress: customContract,
        abi: AdmgrCommercialOffering.abi,
        methodName: "setCampaignManager",
        methodArgs: [md.campaign_manager_address]
      });

      await client.CallContractMethod({
        contractAddress: customContract,
        abi: AdmgrCommercialOffering.abi,
        methodName: "setMandatorySponsoring",
        methodArgs: [md.mandatory_sponsoring]
      });
    }

    const presetCharge = Math.round(presetAccessCharge * 1000000000000000000).toString();
    await client.CallContractMethod({
      contractAddress: customContract,
      abi: AdmgrCommercialOffering.abi,
      methodName: "setPresetAccessCharge",
      methodArgs: [presetAccessCharge]
    });
    await client.CallContractMethod({
      contractAddress: customContract,
      abi: AdmgrCommercialOffering.abi,
      methodName: "setMandatoryPresetAccessCharge",
      methodArgs: [mandatoryPresetAccessCharge]
    });

    await client.MergeMetadata({
      libraryId: libraryId,
      objectId: objectId,
      writeToken: writeToken,
      metadata: md
    });
  }

}

exports.ElvMediaPlatform = ElvMediaPlatform;
