/*
  QSH - Content Shell
  CLI to view and edit fabric objects through a shell interface.
  Created by Wayne Tran

  Usage: PRIVATE_KEY=0x0000 node qsh.js
*/

const { ElvClient } = require("../src/ElvClient");
const readline = require('readline');
const ClientConfiguration = require("../TestConfiguration.json");
var shellparse = require('shell-quote').parse;

const commands = {
  "help" : "List commands.",
  "access" : "Usage: access [Fabric ID].\nSets the current content to [Fabric ID]. eg iq..., ilib..., etc.",
  "files" : "List files of the current content if applicable.",
  "meta" : "Show content metadata.",
  "link" : "Usage: link [TARGET] [PATH]. \nCreates a link from target file to metadata path.",
  "exit" : "Exit the shell. Same as CTRL-C.",
}

/*
  State - Shell state variables
*/
class State {

  constructor({client}){
    this.currentId = "";  //ObjectId, LibraryId etc...
    this.path = "";       //current Path in the files tree
    this.client = client;

    this.getCurrent = this.getCurrent.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.getPath = this.getPath.bind(this);
    this.setPath = this.setPath.bind(this);
  }

  getCurrent(){
    return this.currentId;
  }

  async setCurrent(id){
    this.currentId = id;
  }

  getPath (){
    return this.path;
  }

  async setPath(path){
    this.path = path;
  }

}

const GetFiles = async ({client, objectId}) => {
  try {
    console.log("GET FILES " + objectId);
    const libraryId = await client.ContentObjectLibraryId({objectId});
    const files = await client.ListFiles({libraryId,objectId});
    return files;
  } catch(error) {
    console.error("Error getting files:");
    console.error(error);
  }

  return null;
}

const GetMeta = async ({client, objectId}) => {
  try {
    console.log("GET META " + objectId);
    const libraryId = await client.ContentObjectLibraryId({objectId});
    const meta = await client.ContentObjectMetadata({libraryId, objectId});
    return meta;
  } catch(error) {
    console.error("Error getting files:");
    console.error(error);
  }

  return null;
}

const Link = async ({client, objectId, path, target}) =>{
  try {
    console.log("LINK target: " + target + " path: " +path);
    const libraryId = await client.ContentObjectLibraryId({objectId});
    const editResult = await client.EditContentObject({libraryId, objectId});
    const writeToken = editResult.write_token
    console.log("writeToken: " + writeToken);

    await client.CreateLinks({
      libraryId,
      objectId,
      writeToken,
      links: [
        {
          target,
          path
        }
      ]
    });

    await client.FinalizeContentObject({libraryId, objectId, writeToken});

    const url = await client.LinkUrl({libraryId, objectId, linkPath:path});
    console.log("Link success: " + url);

  } catch(error) {
    console.error("Error creating link:");
    console.error(error);
  }
}

const JQ = (obj) => {
  return JSON.stringify(obj,null,2);
}

const IsEmpty = (obj) =>{
  let result = obj === null || obj === undefined || obj === "";
  return result;
}

// MAIN Function
const Main = async () =>{
  const client = await ElvClient.FromConfigurationUrl({
    configUrl: ClientConfiguration["config-url"]
  });

  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});

/*
  try {
    let result = await client.ContentObjectLibraryId({objectId:"iq__2s84rVseU6owbioNSAjN4DaJqhta"});
    //let result = await client.ContentObjectLibraryId({objectId:"iq__2s84rvseu6owbionsajn4dajqhta"});
    // let result = await client.ContentLibraries();
    console.log("test result: " + result)
  }catch(error) {
    console.error("Error getting files:");
    console.error(error);
  }
*/

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'QSH > '
  });

  let state = new State({client});

  rl.on('line', async (line) => {
    line = line.trim();

    let split = shellparse(line);
    if(IsEmpty(split)){
      rl.prompt();
      return;
    }

    // console.log("Split " + JQ(split));

    let command = split[0].trim();

    let args = split.slice(1);
    command = command.toLowerCase();

    if(command !== "access" && command !== "help" && IsEmpty(state.getCurrent())) {
      console.log("Please 'access [Fabric ID]' first.");
      rl.prompt();
      return;
    }
    let objectId = state.getCurrent();

    // console.log("objectId " + objectId + " : iq__2s84rVseU6owbioNSAjN4DaJqhta");

    switch (command) {
      case 'access':
        if(IsEmpty(args)){
          break;
        }
        await state.setCurrent(args[0]);
        rl.setPrompt(state.getCurrent() + " >");
        break;
      case 'files':
        let files = await GetFiles({objectId, client});
        console.log(JQ(files));
        break;
      case 'meta':
          const meta = await GetMeta({objectId, client});
          console.log(JQ(meta));
          break;
      case 'link':
          if(args.length != 2){
            console.log("Link needs 2 arguments [TARGET] and [PATH]");
            break;
          }

          let target = args[0];
          let path = args[1];
          await Link({objectId, target, path, client});
          break;
      case 'help':
          console.log('List of commands: ');

          const keys = Object.keys(commands)
          for (const key of keys) {
            console.log("\n'" + key + "'\n" + commands[key]);
          }

          break;
      case 'exit':
          console.log('Buh Bye!');
          process.exit(0);
          break;
      case '':
        break;
      default:
        console.log(`Invalid command: '${line.trim()}'`);
        break;
    }

    console.log("\n");
    rl.prompt();
  }).on('close', () => {
    console.log('Buh Bye!');
    process.exit(0);
  });

  console.log("Welcome to the Eluvio Content Shell.\nEnter 'help' for commands.")

  rl.prompt();
}

//Execution
Main();
