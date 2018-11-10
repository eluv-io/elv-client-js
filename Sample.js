const { ElvClient } = require("./src/ElvClient.js");

let client2 = new ElvClient({
  //contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
  hostname: "localhost",
  port: 8008,
  useHTTPS: false,
  ethHostname: "localhost",
  ethPort: 7545,
  ethUseHTTPS: false
});

const client = new ElvClient({
  hostname: "q1.contentfabric.io",
  port: 80,
  useHTTPS: false,
  ethHostname: "eth1.contentfabric.io",
  ethPort: 8545,
  ethUseHTTPS: false
});

const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Alice",
  //privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
  privateKey: "1307df44f8f5033ec86434a7965234015da85261df149ed498cb29907df38d72"
});

const GetFullContentObject = async ({libraryId, objectId}) => {
  const objectInfo = await client.ContentObject({
    libraryId,
    contentHash: objectId
  });

  objectInfo.meta = await client.ContentObjectMetadata({
    libraryId,
    contentHash: objectId
  });

  return objectInfo;
};

const SampleCreateContent = async () => {
  try {
    // Create library with library contract
    const libraryInfo = await client.CreateContentLibrary({
      name: "Hello World Library",
      description: "Test library",
      publicMetadata: {
        "public": {
          meta: "data"
        }
      },
      signer
    });

    console.log("Created library: ");
    console.log(libraryInfo);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create content object with content object contract
    const createResponse = await client.CreateContentObject({
      libraryId: libraryInfo.libraryId,
      libraryContractAddress: libraryInfo.contractAddress,
      options: {
        meta: {
          "name": "My new contract",
          "description": "Special contract to handle my special project",
        }
      },
      signer
    });

    console.log("\nCreated draft content object: ");
    console.log(createResponse);

    // Finalize object
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId: libraryInfo.libraryId,
      writeToken: createResponse.write_token
    });

    console.log("\nFinalized content object: ");
    console.log(finalizeResponse);

    // Get object info for display
    const contentObjectInfo = await GetFullContentObject({
      libraryId: libraryInfo.libraryId,
      objectId: finalizeResponse.id
    });

    console.log("\nContent object:");
    console.log(contentObjectInfo);

    return {
      libraryId: libraryInfo.libraryId,
      libraryContractAddress: libraryInfo.contractAddress,
      contentObjectId: finalizeResponse.id,
      contentContractAddress: createResponse.contractAddress
    };
  } catch(error) {
    console.error(error);
  }
};

const SampleUpdateContent = async ({libraryId, contentObjectId}) => {
  // Edit content object metadata

  const editResponse = await client.EditContentObject({
    libraryId,
    contentId: contentObjectId
  });

  console.log("\nCreated draft content version: ");
  console.log(editResponse);

  await client.MergeMetadata({
    libraryId,
    writeToken: editResponse.write_token,
    metadata: { "latest_count": 700, "latest_level": 400 }
  });

  console.log("\nUpdated metadata");

  const finalizeResponse = await client.FinalizeContentObject({
    libraryId,
    writeToken: editResponse.write_token
  });

  console.log("\nFinalized new content object version: ");
  console.log(finalizeResponse);

  // Get object info for display
  const contentObjectInfo = await GetFullContentObject({
    libraryId: libraryId,
    objectId: contentObjectId
  });

  console.log("\nContent object:");
  console.log(contentObjectInfo);
};

const Sample = async () => {
  console.log("\nCreating content library and object...");
  console.log("==========================");

  const createResult = await SampleCreateContent();

  console.log("\n\nDeploying and setting custom contract");
  console.log("=====================================");

  // Set custom contract
  // - See contract section in DEV_README.md for more information about
  // - dealing with contract code
  const HelloWorldContract = {"abi":[{"constant":true,"inputs":[],"name":"creator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"proposed_status_code","type":"int256"}],"name":"runStatusChange","outputs":[{"name":"","type":"int256"},{"name":"","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"request_ID","type":"uint256"}],"name":"runFinalize","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newCreator","type":"address"}],"name":"transferCreatorship","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"credit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"level","type":"uint8"},{"name":"customValues","type":"bytes32[]"},{"name":"stakeholders","type":"address[]"}],"name":"runAccessCharge","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"},{"indexed":false,"name":"stakeHolder0","type":"address"}],"name":"HelloWorldEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"s","type":"string"}],"name":"DbgString","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"a","type":"address"}],"name":"DbgAddress","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"u","type":"uint256"}],"name":"DbgUint256","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"u","type":"uint256"}],"name":"DbgUint","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"level","type":"uint8"},{"indexed":false,"name":"calculateAccessCharge","type":"int256"}],"name":"RunAccessCharge","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"request_ID","type":"uint256"},{"indexed":false,"name":"result","type":"uint256"}],"name":"RunAccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"request_ID","type":"uint256"},{"indexed":false,"name":"result","type":"bool"}],"name":"RunFinalize","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proposed_status_code","type":"int256"},{"indexed":false,"name":"return_status_code","type":"int256"},{"indexed":false,"name":"licenseFeeToBePaid","type":"int256"}],"name":"RunStatusChange","type":"event"},{"constant":false,"inputs":[{"name":"","type":"uint256"},{"name":"","type":"uint8"},{"name":"","type":"bytes32[]"},{"name":"stake_holders","type":"address[]"}],"name":"runAccess","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"newCredit","type":"uint256"}],"name":"setCredit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}],"bytecode":"0x6080604052670de0b6b3a7640000600255326000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555032600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610a80806100a06000396000f3006080604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806302d05d3f146100b1578063123e0e80146101085780633513a805146101cf57806341c0e1b5146102175780636b2d13241461022e5780636d2e4b1b146102735780638da5cb5b146102b6578063a06d083c1461030d578063eac1d5b714610338578063f2fde38b14610365578063f8117ca2146103a8575b005b3480156100bd57600080fd5b506100c6610472565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101b960048036038101908080359060200190929190803560ff1690602001909291908035906020019082018035906020019080806020026020016040519081016040528093929190818152602001838360200280828437820191505050505050919291929080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509192919290505050610497565b6040518082815260200191505060405180910390f35b3480156101db57600080fd5b506101fa60048036038101908080359060200190929190505050610654565b604051808381526020018281526020019250505060405180910390f35b34801561022357600080fd5b5061022c610685565b005b34801561023a57600080fd5b506102596004803603810190808035906020019092919050505061071c565b604051808215151515815260200191505060405180910390f35b34801561027f57600080fd5b506102b4600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610727565b005b3480156102c257600080fd5b506102cb6108ba565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561031957600080fd5b506103226108e0565b6040518082815260200191505060405180910390f35b34801561034457600080fd5b50610363600480360381019080803590602001909291905050506108e6565b005b34801561037157600080fd5b506103a6600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061094c565b005b3480156103b457600080fd5b5061045c600480360381019080803560ff1690602001909291908035906020019082018035906020019080806020026020016040519081016040528093929190818152602001838360200280828437820191505050505050919291929080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509192919290505050610a28565b6040518082815260200191505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080825111156105c0577f21a238faf9b1599dfd0896a25399dae15f4b9876675a2987f55a6460b8a79fc48260008151811015156104d257fe5b9060200190602002015160405180806020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828103825260088152602001807f48692074686572650000000000000000000000000000000000000000000000008152506020019250505060405180910390a181600081518110151561056557fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff166108fc6002549081150290604051600060405180830381858888f193505050501580156105b6573d6000803e3d6000fd5b506000905061064c565b7f21a238faf9b1599dfd0896a25399dae15f4b9876675a2987f55a6460b8a79fc4600060405180806020018373ffffffffffffffffffffffffffffffffffffffff1681526020018281038252601b8152602001807f4869207468657265202d206e6f207374616b6520686f6c6465727300000000008152506020019250505060405180910390a1600190505b949350505050565b600080827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80905091509150915091565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff161415156106e157600080fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b600060019050919050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff1614151561078257600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141515156107be57600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614156108775780600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60025481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff1614151561094257600080fd5b8060028190555050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff161415156109a857600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141515156109e457600080fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff905093925050505600a165627a7a72305820a199f62957b3cb9eb2ff07fd585771ff57d8358c266e57b679895e362f1dedc40029"};

  const deployResult = await client.DeployContract({
    abi: HelloWorldContract.abi,
    bytecode: HelloWorldContract.bytecode,
    signer
  });

  console.log("\nDeployed custom content contract: ");
  console.log(deployResult.address);

  await client.SetCustomContentContract({
    contentContractAddress: createResult.contentContractAddress,
    customContractAddress: deployResult.address,
    signer
  });

  console.log("\nSet custom contract on content object");

  console.log("\n\nUpdating content object...");
  console.log("==========================");

  await SampleUpdateContent({
    libraryId: createResult.libraryId,
    contentObjectId: createResult.contentObjectId
  });

  console.log("\n");
};

Sample();
