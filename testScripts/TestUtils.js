const Verifier = artifacts.require("Verifier");

var assert = require("assert");

function toHex(str) {
  var hex = "";
  for(var i=0;i<str.length;i++) {
    hex += ""+str.charCodeAt(i).toString(16);
  }
  return hex;
}

contract("Utils", accounts => {

  // disabled for now. looks like there's a fatal mismatch between truffle and web3 right now.
  // would like to still keep the code around for reference.
  xit ("correctly creates and verifies hash signature", async () => {

    const addr = accounts[0];
    const msg = "school bus";
    const hex_msg = "0x" + toHex(msg);

    // sign the raw message
    let signature = await web3.eth.sign(hex_msg, addr);

    signature = signature.substr(2);
    const r = "0x" + signature.slice(0, 64);
    const s = "0x" + signature.slice(64, 128);
    const v = "0x" + signature.slice(128, 130);
    var v_decimal = web3.utils.hexToNumber(v);
    if(v_decimal !== 27 || v_decimal !== 28) {
      v_decimal += 27;
    }

    // ecrecover (which is called in recoverAddr) uses the hash of the message
    // looks like eth.sign prepends this header info so we need to do it here too to get the sha3's to match
    const fixed_msg = `\x19Ethereum Signed Message:\n${msg.length}${msg}`;
    const fixed_msg_sha = await web3.utils.sha3(fixed_msg);

    const ver = await Verifier.deployed();
    const data = await ver.recoverAddr.call(fixed_msg_sha, v_decimal, r, s);
    assert.strictEqual(addr, data, "recovered address should be the same as signing address");
  });

});
