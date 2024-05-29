const UrlJoin = require("url-join");

const {Initialize} = require("./utils/Utils");
const {
  afterAll,
  beforeAll,
  describe,
  expect,
  runTests,
  test
} = Initialize();

const PermissionsClient = require("../src/PermissionsClient");

const OutputLogger = require("./utils/OutputLogger");
const {CreateClient, ReturnBalance} = require("./utils/Utils");

let client, permissionsClient, libraryId, policyId, itemId1, itemId2, itemId3, groupAddress;

const now = Date.now();
const later = Date.now() + 365 * 24 * 60 * 60 * 1000;

describe("Test Permissions Client", () => {
  beforeAll(async () => {
    try {
      client = await CreateClient("ElvClient");

      permissionsClient = OutputLogger(PermissionsClient, new PermissionsClient(client));

      libraryId = await client.CreateContentLibrary({name: "ElvClient Test Suite: Permissions Test"});

      const policyObject = await client.CreateAndFinalizeContentObject({libraryId});

      const itemObject1 = await client.CreateAndFinalizeContentObject({
        libraryId,
        callback: async ({objectId, writeToken}) => {
          await client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadata: {
              public: {
                name: "Item 1"
              }
            }
          });
        }
      });

      const itemObject2 = await client.CreateAndFinalizeContentObject({
        libraryId,
        callback: async ({objectId, writeToken}) => {
          await client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadata: {
              public: {
                asset_metadata: {
                  display_title: "Item 2"
                }
              }
            }
          });
        }
      });

      const itemObject3 = await client.CreateAndFinalizeContentObject({
        libraryId,
        callback: async ({objectId, writeToken}) => {
          await client.ReplaceMetadata({
            libraryId,
            objectId,
            writeToken,
            metadata: {
              public: {
                asset_metadata: {
                  display_title: "Item 3"
                }
              }
            }
          });
        }
      });

      policyId = policyObject.id;
      itemId1 = itemObject1.id;
      itemId2 = itemObject2.id;
      itemId3 = itemObject3.id;
      groupAddress = await client.CreateAccessGroup({name: "Test Group"});
    } catch(error) {
      console.error("\n\nSetup failed:");
      console.error(error);

      await ReturnBalance(client);
      process.exit(1);
    }
  });

  afterAll(async () => {
    await client.DeleteContentObject({libraryId, objectId: itemId1});
    await client.DeleteContentObject({libraryId, objectId: itemId2});
    await client.DeleteContentObject({libraryId, objectId: itemId3});

    await ReturnBalance(client);
  });

  describe("Test Permissions Client", () => {
    test("Create Item Policy", async () => {
      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.CreateItemPolicy({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId1,
            profiles: {
              default: {}
            }
          });
        }
      });

      const policyMetadata1 = await client.ContentObjectMetadata({libraryId, objectId: policyId});

      expect(policyMetadata1).toBeDefined();
      expect(policyMetadata1.auth_policy_spec).toBeDefined();
      expect(policyMetadata1.auth_policy_spec[itemId1]).toBeDefined();
      const spec1 = policyMetadata1.auth_policy_spec[itemId1];

      expect(spec1.display_title).toEqual("Item 1");
      expect(spec1.permissions).toEqual([]);
      expect(spec1.profiles).toBeDefined();
      expect(spec1.profiles.default).toBeDefined();

      expect(spec1.profiles).toMatchObject({
        default: {
          assets: {
            default_permission: "no-access"
          },
          offerings: {
            default_permission: "no-access"
          }
        }
      });

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.CreateItemPolicy({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            profiles: {
              "all-access": {
                assets: {
                  default_permission: "full-access"
                },
                offerings: {
                  default_permission: "full-access"
                }
              },
              "special-access": {
                start: new Date(now).toISOString(),
                end: new Date(later).toISOString(),
                assets: {
                  default_permission: "no-access",
                  custom_permissions: {
                    "asset-id-1": {
                      start: new Date(now).toISOString(),
                      end: new Date(later).toISOString(),
                      permission: "full-access"
                    },
                    "asset-id-2": {
                      start: new Date(now).toISOString(),
                      permission: "full-access"
                    },
                    "asset-id-3": {
                      permission: "no-access"
                    }
                  }
                },
                offerings: {
                  default_permission: "no-access",
                  custom_permissions: {
                    "offering-id-1": {
                      start: new Date(now).toISOString(),
                      end: new Date(later).toISOString(),
                      permission: "full-access"
                    },
                    "offering-id-2": {
                      end: new Date(later).toISOString(),
                      permission: "full-access"
                    },
                    "offering-id-3": {
                      permission: "no-access"
                    }
                  }
                }
              },
              "no-access": {
                start: now,
                end: later,
                assets: {
                  default_permission: "no-access"
                },
                offerings: {
                  default_permission: "no-access"
                }
              }
            }
          });
        }
      });

      const policyMetadata2 = await client.ContentObjectMetadata({libraryId, objectId: policyId});

      expect(policyMetadata2).toBeDefined();
      expect(policyMetadata2.auth_policy_spec).toBeDefined();
      expect(policyMetadata2.auth_policy_spec[itemId2]).toBeDefined();
      const spec2 = policyMetadata2.auth_policy_spec[itemId2];

      expect(spec2.display_title).toEqual("Item 2");
      expect(spec2.permissions).toEqual([]);
      expect(spec2.profiles).toBeDefined();
      expect(spec2.profiles["all-access"]).toBeDefined();
      expect(spec2.profiles["special-access"]).toBeDefined();
      expect(spec2.profiles["no-access"]).toBeDefined();

      expect(spec2.profiles["all-access"]).toMatchObject({
        assets: {
          default_permission: "full-access"
        },
        offerings: {
          default_permission: "full-access"
        }
      });

      expect(spec2.profiles["special-access"].assets.custom_permissions).toBeDefined();
      expect(spec2.profiles["special-access"].assets.custom_permissions).toMatchObject({
        "asset-id-1": {
          start: new Date(now).toISOString(),
          end: new Date(later).toISOString(),
          permission: "full-access"
        },
        "asset-id-2": {
          start: new Date(now).toISOString(),
          permission: "full-access"
        },
        "asset-id-3": {
          permission: "no-access"
        }
      });

      expect(spec2.profiles["special-access"].offerings.custom_permissions).toBeDefined();
      expect(spec2.profiles["special-access"].offerings.custom_permissions).toMatchObject({
        "offering-id-1": {
          start: new Date(now).toISOString(),
          end: new Date(later).toISOString(),
          permission: "full-access"
        },
        "offering-id-2": {
          end: new Date(later).toISOString(),
          permission: "full-access"
        },
        "offering-id-3": {
          permission: "no-access"
        }
      });

      expect(spec2.profiles["no-access"]).toMatchObject({
        start: new Date(now).toISOString(),
        end: new Date(later).toISOString(),
        assets: {
          default_permission: "no-access"
        },
        offerings: {
          default_permission: "no-access"
        }
      });
    });

    test("Add/Modify Profiles", async () => {
      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.SetProfile({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId1,
            profileName: "Special Access",
            profileSpec: {
              start: new Date(now).toISOString(),
              end: new Date(later).toISOString(),
              assets: {
                default_permission: "no-access"
              },
              offerings: {
                default_permission: "full-access",
                custom_permissions: {
                  "offering-id-1": {
                    start: new Date(now).toISOString(),
                    end: new Date(later).toISOString(),
                    permission: "full-access"
                  },
                  "offering-id-2": {
                    start: new Date(now).toISOString(),
                    permission: "full-access"
                  },
                  "offering-id-3": {
                    permission: "no-access"
                  }
                }
              }
            }
          });
        }
      });

      const profile = await permissionsClient.ItemProfiles({
        policyId,
        itemId: itemId1,
        profileName: "Special Access"
      });

      expect(profile).toBeDefined();
      expect(profile).toMatchObject({
        start: new Date(now).toISOString(),
        end: new Date(later).toISOString(),
        assets: {
          default_permission: "no-access"
        },
        offerings: {
          default_permission: "full-access",
          custom_permissions: {
            "offering-id-1": {
              start: new Date(now).toISOString(),
              end: new Date(later).toISOString(),
              permission: "full-access"
            },
            "offering-id-2": {
              start: new Date(now).toISOString(),
              permission: "full-access"
            },
            "offering-id-3": {
              permission: "no-access"
            }
          }
        }
      });

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.SetProfile({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId1,
            profileName: "Special Access",
            profileSpec: {
              start: null,
              end: null,
              assets: {
                default_permission: "full-access",
                custom_permissions: {
                  "asset-id-1": {
                    start: new Date(now).toISOString(),
                    end: new Date(later).toISOString(),
                    permission: "full-access"
                  },
                  "asset-id-2": {
                    start: new Date(now).toISOString(),
                    permission: "full-access"
                  },
                  "asset-id-3": {
                    permission: "no-access"
                  }
                }
              },
              offerings: {
                default_permission: "full-access",
                custom_permissions: {}
              }
            }
          });
        }
      });

      const modifiedProfile = await permissionsClient.ItemProfiles({
        policyId,
        itemId: itemId1,
        profileName: "Special Access"
      });

      expect(modifiedProfile).toBeDefined();
      expect(modifiedProfile).toMatchObject({
        assets: {
          default_permission: "full-access",
          custom_permissions: {
            "asset-id-1": {
              start: new Date(now).toISOString(),
              end: new Date(later).toISOString(),
              permission: "full-access"
            },
            "asset-id-2": {
              start: new Date(now).toISOString(),
              permission: "full-access"
            },
            "asset-id-3": {
              permission: "no-access"
            }
          }
        },
        offerings: {
          default_permission: "full-access",
          custom_permissions: {}
        }
      });

      const allProfiles = await permissionsClient.ItemProfiles({
        policyId,
        itemId: itemId2
      });

      expect(allProfiles).toBeDefined();
      expect(Object.keys(allProfiles).length).toEqual(3);
      expect(allProfiles["all-access"]).toBeDefined();
      expect(allProfiles["special-access"]).toBeDefined();
      expect(allProfiles["no-access"]).toBeDefined();
    });

    test("Add/Modify Permissions", async () => {
      const initialPermissions = await permissionsClient.ItemPermissions({
        policyId,
        itemId: itemId2
      });

      expect(initialPermissions).toBeDefined();
      expect(initialPermissions.length).toEqual(0);

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: client.utils.FormatAddress(client.signer.address),
            subjectName: "Test Account",
            subjectType: "user",
            subjectSource: "fabric",
            profileName: "all-access"
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: groupAddress,
            subjectName: "Test Group",
            subjectType: "group",
            subjectSource: "fabric",
            profileName: "no-access",
            start: now
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "00uyyha6cjm2Q7Zgv4x6",
            subjectName: "OAuth Group",
            subjectType: "group",
            subjectSource: "oauth",
            profileName: "special-access",
            start: new Date(now).toISOString(),
            end: new Date(later).toISOString()
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "00g102v1ayVs5WQOu4x7",
            subjectName: "OAuth User (oauth@user.com)",
            subjectType: "user",
            subjectSource: "oauth",
            profileName: "special-access"
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "QOTPQVagZQv7Mkt",
            subjectName: "Special Event NTP Instance",
            subjectType: "ntp",
            subjectSource: "fabric",
            profileName: "special-access"
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "special.event.subject@ntp.com",
            subjectNTPId: "QOTPQVagZQv7Mkt",
            subjectType: "ntp_subject",
            subjectSource: "fabric",
            profileName: "special-access"
          });
        }
      });

      // Test both raw metadata and formatted result from ItemPermissions
      const permissionsMetadata = await client.ContentObjectMetadata({
        libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_spec", itemId2, "permissions")
      });

      expect(permissionsMetadata).toBeDefined();
      expect(permissionsMetadata.length).toEqual(6);

      expect(permissionsMetadata[0]).toMatchObject({
        profile: "all-access",
        subject: {
          id: `iusr${client.utils.AddressToHash(client.signer.address)}`,
          type: "user"
        }
      });

      expect(permissionsMetadata[1]).toMatchObject({
        profile: "no-access",
        start: new Date(now).toISOString(),
        subject: {
          id: `igrp${client.utils.AddressToHash(groupAddress)}`,
          type: "group"
        }
      });

      expect(permissionsMetadata[2]).toMatchObject({
        profile: "special-access",
        start: new Date(now).toISOString(),
        end: new Date(later).toISOString(),
        subject: {
          id: "OAuth Group",
          oauth_id: "00uyyha6cjm2Q7Zgv4x6",
          type: "oauth_group"
        }
      });

      expect(permissionsMetadata[3]).toMatchObject({
        profile: "special-access",
        subject: {
          id: "OAuth User (oauth@user.com)",
          oauth_id: "00g102v1ayVs5WQOu4x7",
          type: "oauth_user"
        }
      });

      expect(permissionsMetadata[4]).toMatchObject({
        profile: "special-access",
        subject: {
          id: "QOTPQVagZQv7Mkt",
          type: "otp"
        }
      });

      expect(permissionsMetadata[5]).toMatchObject({
        profile: "special-access",
        subject: {
          id: "special.event.subject@ntp.com",
          otp_id: "QOTPQVagZQv7Mkt",
          type: "otp_subject"
        }
      });

      const permissions = await permissionsClient.ItemPermissions({
        policyId,
        itemId: itemId2
      });

      expect(permissions).toBeDefined();
      expect(permissions.length).toEqual(6);

      expect(permissions[0]).toMatchObject({
        profileName: "all-access",
        subjectSource: "fabric",
        subjectType: "user",
        subjectId: client.utils.FormatAddress(client.signer.address),
        subjectName: "Test Account"
      });

      expect(permissions[1]).toMatchObject({
        profileName: "no-access",
        start: new Date(now).toISOString(),
        subjectSource: "fabric",
        subjectType: "group",
        subjectId: groupAddress,
        subjectName: "Test Group"
      });

      expect(permissions[2]).toMatchObject({
        profileName: "special-access",
        start: new Date(now).toISOString(),
        end: new Date(later).toISOString(),
        subjectSource: "oauth",
        subjectType: "group",
        subjectId: "00uyyha6cjm2Q7Zgv4x6",
        subjectName: "OAuth Group"
      });

      expect(permissions[3]).toMatchObject({
        profileName: "special-access",
        subjectSource: "oauth",
        subjectType: "user",
        subjectId: "00g102v1ayVs5WQOu4x7",
        subjectName: "OAuth User (oauth@user.com)"
      });

      expect(permissions[4]).toMatchObject({
        profileName: "special-access",
        subjectSource: "fabric",
        subjectType: "ntp",
        subjectId: "QOTPQVagZQv7Mkt",
        subjectName: "Special Event NTP Instance",
      });

      expect(permissions[5]).toMatchObject({
        profileName: "special-access",
        subjectSource: "fabric",
        subjectType: "ntp_subject",
        subjectNTPId: "QOTPQVagZQv7Mkt",
        subjectId: "special.event.subject@ntp.com",
        subjectName: "special.event.subject@ntp.com"
      });

      // Ensure fabric user name is stored properly
      const userInfo = await client.ContentObjectMetadata({
        libraryId: libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", client.utils.FormatAddress(client.signer.address))
      });

      expect(userInfo).toBeDefined();
      expect(userInfo.name).toEqual("Test Account");

      // Ensure NTP info is stored properly
      const ntpInfo = await client.ContentObjectMetadata({
        libraryId: libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_settings", "ntp_instances", "QOTPQVagZQv7Mkt")
      });

      expect(ntpInfo).toBeDefined();
      expect(ntpInfo.name).toEqual("Special Event NTP Instance");
      expect(ntpInfo.ntpId).toEqual("QOTPQVagZQv7Mkt");

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: client.utils.FormatAddress(client.signer.address),
            subjectName: "Test Account",
            subjectType: "user",
            subjectSource: "fabric",
            profileName: "no-access",
            start: now,
            end: later
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "00uyyha6cjm2Q7Zgv4x6",
            subjectName: "OAuth Group",
            subjectType: "group",
            subjectSource: "oauth",
            profileName: "special-access",
            start: new Date(later).toISOString(),
            end: null
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "00uqyha3cjm2Q7Zgv492",
            subjectName: "OAuth Group 2",
            subjectType: "group",
            subjectSource: "oauth",
            profileName: "special-access",
          });
        }
      });

      // Test both raw metadata and formatted result from ItemPermissions
      const modifiedPermissionsMetadata = await client.ContentObjectMetadata({
        libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_spec", itemId2, "permissions")
      });

      expect(modifiedPermissionsMetadata).toBeDefined();
      expect(modifiedPermissionsMetadata.length).toEqual(7);

      expect(modifiedPermissionsMetadata[0]).toMatchObject({
        profile: "no-access",
        start: new Date(now).toISOString(),
        end: new Date(later).toISOString(),
        subject: {
          id: `iusr${client.utils.AddressToHash(client.signer.address)}`,
          type: "user"
        }
      });

      expect(modifiedPermissionsMetadata[2]).toMatchObject({
        profile: "special-access",
        start: new Date(later).toISOString(),
        subject: {
          id: "OAuth Group",
          oauth_id: "00uyyha6cjm2Q7Zgv4x6",
          type: "oauth_group"
        }
      });

      expect(modifiedPermissionsMetadata[6]).toMatchObject({
        profile: "special-access",
        subject: {
          id: "OAuth Group 2",
          oauth_id: "00uqyha3cjm2Q7Zgv492",
          type: "oauth_group"
        }
      });

      const modifiedPermissions = await permissionsClient.ItemPermissions({
        policyId,
        itemId: itemId2
      });

      expect(modifiedPermissions).toBeDefined();
      expect(modifiedPermissions.length).toEqual(7);

      expect(modifiedPermissions[0]).toMatchObject({
        profileName: "no-access",
        start: new Date(now).toISOString(),
        end: new Date(later).toISOString(),
        subjectSource: "fabric",
        subjectType: "user",
        subjectId: client.utils.FormatAddress(client.signer.address),
        subjectName: "Test Account"
      });

      expect(modifiedPermissions[2]).toMatchObject({
        profileName: "special-access",
        start: new Date(later).toISOString(),
        subjectSource: "oauth",
        subjectType: "group",
        subjectId: "00uyyha6cjm2Q7Zgv4x6",
        subjectName: "OAuth Group"
      });

      expect(modifiedPermissions[6]).toMatchObject({
        profileName: "special-access",
        subjectSource: "oauth",
        subjectType: "group",
        subjectId: "00uqyha3cjm2Q7Zgv492",
        subjectName: "OAuth Group 2"
      });
    });

    test("Add/Modify Permissions using offline draft", async () => {
      try {
        permissionsClient.offline = true;

        await client.EditAndFinalizeContentObject({
          libraryId,
          objectId: policyId,
          callback: async ({writeToken}) => {
            await permissionsClient.CreateItemPolicy({
              policyId,
              policyWriteToken: writeToken,
              itemId: itemId3,
              profiles: {
                "all-access": {
                  assets: {
                    default_permission: "full-access"
                  },
                  offerings: {
                    default_permission: "full-access"
                  }
                },
                "no-access": {
                  start: now,
                  end: later,
                  assets: {
                    default_permission: "no-access"
                  },
                  offerings: {
                    default_permission: "no-access"
                  }
                }
              }
            });
          }
        });

        const initialPermissions = await permissionsClient.ItemPermissions({
          policyId,
          itemId: itemId3
        });

        expect(initialPermissions).toBeDefined();

        await client.EditAndFinalizeContentObject({
          libraryId,
          objectId: policyId,
          callback: async ({writeToken}) => {
            await permissionsClient.OpenOfflineDraft({
              policyId,
              policyWriteToken: writeToken,
            });

            await permissionsClient.SetPermission({
              policyId,
              policyWriteToken: writeToken,
              itemId: itemId3,
              subjectId: client.utils.FormatAddress(client.signer.address),
              subjectName: "Test Account Offline",
              subjectType: "user",
              subjectSource: "fabric",
              profileName: "all-access"
            });

            await permissionsClient.SetPermission({
              policyId,
              policyWriteToken: writeToken,
              itemId: itemId3,
              subjectId: groupAddress,
              subjectName: "Test Group Offline",
              subjectType: "group",
              subjectSource: "fabric",
              profileName: "no-access",
              start: now
            });

            await permissionsClient.CloseOfflineDraft({
              policyId
            });
          }
        });

        // Test both raw metadata and formatted result from ItemPermissions
        const permissionsMetadata = await client.ContentObjectMetadata({
          libraryId,
          objectId: policyId,
          metadataSubtree: UrlJoin("auth_policy_spec", itemId2, "permissions")
        });

        expect(permissionsMetadata).toBeDefined();

        const permissions = await permissionsClient.ItemPermissions({
          policyId,
          itemId: itemId3
        });

        expect(permissions).toBeDefined();
        expect(permissions.length).toEqual(2);

        // Remove permissions added by this test
        // PENDING - use offline draft
        await client.EditAndFinalizeContentObject({
          libraryId,
          objectId: policyId,
          callback: async ({writeToken}) => {
            await permissionsClient.RemovePermission({
              policyId,
              policyWriteToken: writeToken,
              itemId: itemId3,
              subjectId: client.utils.FormatAddress(client.signer.address)
            });
            await permissionsClient.RemovePermission({
              policyId,
              policyWriteToken: writeToken,
              itemId: itemId3,
              subjectId: groupAddress
            });
          }
        });
      } finally {
        permissionsClient.offline = false;
      }
    });

    test("Retrieve Item Policy", async () => {
      const initializedPolicy = await permissionsClient.ItemPolicy({policyId, itemId: itemId2});

      expect(initializedPolicy.profiles).toBeDefined();
      expect(initializedPolicy.permissions).toBeDefined();

      const uninitializedPolicy = await permissionsClient.ItemPolicy({policyId, itemId: "uninitializedId"});

      expect(uninitializedPolicy).not.toBeDefined();

      const allItems = await permissionsClient.PolicyItems({policyId});

      expect(allItems).toBeDefined();
      expect(Object.keys(allItems).length).toEqual(3);

      expect(allItems[itemId1]).toBeDefined();
      expect(allItems[itemId1].display_title).toEqual("Item 1");

      expect(allItems[itemId2]).toBeDefined();
      expect(allItems[itemId2].display_title).toEqual("Item 2");
    });

    test("Retrieve Subject Permissions", async () => {
      const subjectPermissions1 = await permissionsClient.SubjectPermissions({
        policyId,
        subjectId: "00uyyha6cjm2Q7Zgv4x6"
      });

      expect(subjectPermissions1).toBeDefined();
      expect(Object.keys(subjectPermissions1).length).toEqual(1);
      expect(subjectPermissions1[itemId2]).toBeDefined();
      expect(subjectPermissions1[itemId2].permissions).toBeDefined();
      expect(subjectPermissions1[itemId2].permissions.length).toEqual(1);

      const subjectPermissions2 = await permissionsClient.SubjectPermissions({
        policyId,
        subjectId: client.utils.FormatAddress(client.signer.address)
      });

      expect(subjectPermissions2).toBeDefined();
      expect(Object.keys(subjectPermissions2).length).toEqual(1);
      expect(subjectPermissions2[itemId2]).toBeDefined();
      expect(subjectPermissions2[itemId2].permissions).toBeDefined();
      expect(subjectPermissions2[itemId2].permissions.length).toEqual(1);

      const subjectPermissions3 = await permissionsClient.SubjectPermissions({
        policyId,
        subjectId: "special.event.subject@ntp.com"
      });

      expect(subjectPermissions3).toBeDefined();
      expect(Object.keys(subjectPermissions3).length).toEqual(1);
      expect(subjectPermissions3[itemId2]).toBeDefined();
      expect(subjectPermissions3[itemId2].permissions).toBeDefined();
      expect(subjectPermissions3[itemId2].permissions.length).toEqual(1);
    });

    test("Remove Permissions", async () => {
      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.RemovePermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: client.utils.FormatAddress(client.signer.address)
          });

          await permissionsClient.RemovePermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "00uyyha6cjm2Q7Zgv4x6",
          });

          await permissionsClient.RemovePermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "special.event.subject@ntp.com"
          });

          await permissionsClient.SetPermission({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId2,
            subjectId: "00qqwe3ZXm2Q8Zgq494",
            subjectName: "OAuth Group 3",
            subjectType: "group",
            subjectSource: "oauth",
            profileName: "all-access",
          });
        }
      });

      const permissions = await permissionsClient.ItemPermissions({
        policyId,
        itemId: itemId2
      });

      expect(permissions).toBeDefined();
      expect(permissions.length).toEqual(5);

      expect(permissions[0].subjectId).toEqual(groupAddress);

      expect(permissions[4]).toMatchObject({
        profileName: "all-access",
        subjectSource: "oauth",
        subjectType: "group",
        subjectName: "OAuth Group 3",
        subjectId: "00qqwe3ZXm2Q8Zgq494"
      });
    });

    test("Remove Profiles", async () => {
      const profile = await permissionsClient.ItemProfiles({
        policyId,
        itemId: itemId1,
        profileName: "Special Access"
      });

      expect(profile).toBeDefined();

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.RemoveProfile({
            policyId,
            policyWriteToken: writeToken,
            itemId: itemId1,
            profileName: "Special Access"
          });
        }
      });

      const noProfile = await permissionsClient.ItemProfiles({
        policyId,
        itemId: itemId1,
        profileName: "Special Access"
      });

      expect(noProfile).not.toBeDefined();
    });


    test("Remove Subject Permissions", async () => {
      const initialPermissions = await permissionsClient.SubjectPermissions({
        policyId,
        subjectId: "QOTPQVagZQv7Mkt"
      });

      expect(initialPermissions).toBeDefined();
      expect(Object.keys(initialPermissions).length).toBeGreaterThan(0);

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.RemoveSubjectPermissions({
            policyId,
            policyWriteToken: writeToken,
            subjectId: "QOTPQVagZQv7Mkt"
          });
        }
      });

      const finalPermissions = await permissionsClient.SubjectPermissions({
        policyId,
        subjectId: "QOTPQVagZQv7Mkt"
      });

      expect(finalPermissions).toBeDefined();
      expect(Object.keys(finalPermissions).length).toEqual(0);

    });

    test("Remove Item Permissions", async () => {
      const item1Policy1 = await client.ContentObjectMetadata({
        libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_spec", itemId1)
      });

      expect(item1Policy1).toBeDefined();

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.RemoveItemPolicy({policyId, policyWriteToken: writeToken, itemId: itemId1});
        }
      });

      const item1Policy2 = await client.ContentObjectMetadata({
        libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_spec", itemId1)
      });

      expect(item1Policy2).not.toBeDefined();

      const item2Policy1 = await client.ContentObjectMetadata({
        libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_spec", itemId2)
      });

      expect(item2Policy1).toBeDefined();

      await client.EditAndFinalizeContentObject({
        libraryId,
        objectId: policyId,
        callback: async ({writeToken}) => {
          await permissionsClient.RemoveItemPolicy({policyId, policyWriteToken: writeToken, itemId: itemId2});
        }
      });

      const item2Policy2 = await client.ContentObjectMetadata({
        libraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_spec", itemId2)
      });

      expect(item2Policy2).not.toBeDefined();
    });
  });
});

if(!module.parent) { runTests(); }
module.exports = runTests;
