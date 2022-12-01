const R = require("ramda");

const Logger = require("./Logger");
const MP4Atom = require("./MP4Atom");

const blueprint = {
  name: "MP4InitSeg",
  concerns: [Logger, MP4Atom]
};

const New = context => {

  // const logger = context.concerns.Logger;
  const M = context.concerns.MP4Atom;

  // takes buffer containing MP4 init segment (or entire MP4 file) for a single x264/x265 video stream
  // and returns codec descriptor string (e.g. "avc1.640028", "hev1.2.4.L150.90" etc.)
  const codecDesc = buffer => {
    let resultContext = decoderConfigAtom(buffer);
    let {atomLength, atomType, headerLength} = M.readHeader(resultContext);

    // make new buffer that omits header (length and type fields)
    const decoderBodyBuf = resultContext.buffer.subarray(headerLength, atomLength);
    switch(atomType) {
      case "avcC":
        return x264codecString(decoderBodyBuf);
      case "hvcC":
        return x265codecString(decoderBodyBuf);
      default:
        throw Error(`Unknown decoder configuration atom type: '${atomType}'`);
    }
  };

  // buffer containing init segment -> MP4AtomReadContext with buffer containing only avcC or hvcC atom
  const decoderConfigAtom = R.pipe(
    M.newContextFromBuffer,
    M.findAndEnter(["moov"]),
    M.findAndEnter(["trak"]),
    M.findAndEnter(["mdia"]),
    M.findAndEnter(["minf"]),
    M.findAndEnter(["stbl"]),
    M.findAndEnter(["stsd"]),
    M.moveWithin(8),
    M.findAndEnter(["avc1", "encv", "hev1"]),
    M.moveWithin(78),
    M.find(["avcC", "hvcC"]),
    M.readAtom,
    M.newContextFromBuffer
  );

  // takes buffer containing decoder config atom (without the type/length fields at front) and returns x264 codec string
  const x264codecString = atomBodyBuf => {
    // See https://dvb.org/wp-content/uploads/2019/10/a168_DVB_MPEG-DASH_Nov_2017.pdf

    if(atomBodyBuf.length < 4) throw Error("Not enough bytes in AVCDecoderConfiguration");

    const avcProfileIndication = atomBodyBuf.readUInt8(1).toString(16).padStart(2, "0");
    const profileCompatibility = atomBodyBuf.readUInt8(2).toString(16).padStart(2, "0");
    const avcLevelIndication = atomBodyBuf.readUInt8(3).toString(16).padStart(2, "0");
    return `avc1.${avcProfileIndication}${profileCompatibility}${avcLevelIndication}`;
  };

  // takes buffer containing decoder config atom (without the type/length fields at front) and returns x265 codec string
  const x265codecString = atomBodyBuf => {
    // See https://dvb.org/wp-content/uploads/2019/10/a168_DVB_MPEG-DASH_Nov_2017.pdf

    if(atomBodyBuf.length < 13) throw Error("Not enough bytes in HVCDecoderConfiguration");

    // parse bytes/bits into values
    const bitFlags = atomBodyBuf.readUInt8(1);
    const genProfileSpaceBits = (bitFlags & 0b11000000) >>> 6;
    const genTierBit = (bitFlags & 0b00100000) >>> 5;
    const genProfileIDC = bitFlags & 0b00011111;
    const genProfileCompatibility = parseInt(R.reverse(atomBodyBuf.readUInt32BE(2).toString(2).padStart(32, "0")), 2).toString(16);
    let genConstraintFlags = [
      atomBodyBuf.readUInt8(6),
      atomBodyBuf.readUInt8(7),
      atomBodyBuf.readUInt8(8),
      atomBodyBuf.readUInt8(9),
      atomBodyBuf.readUInt8(10),
      atomBodyBuf.readUInt8(11)
    ];
    const genLevelIDC = atomBodyBuf.readUInt8(12);

    // Format values into appropriate strings

    // CODECSTRING = CODEC "." PROFILE "." LEVEL "." CONSTRAINTS

    // CODEC = ("hev1" | "hvc1" )
    let pieces = ["hev1"];

    // PROFILE = PROFILE_SPACE PROFILE_IDC "." PROFILE_COMPATIBILITY

    // PROFILE_SPACE = "" | "A" | "B" | "C" (for general_profile_space values 0,1,2,3)
    let profileSpace = "";
    switch(genProfileSpaceBits){
      case 1:
        profileSpace = "A";
        break;
      case 2:
        profileSpace = "B";
        break;
      case 3:
        profileSpace = "C";
        break;
    }

    // PROFILE_IDC is a decimal number, PROFILE_COMPATIBILITY is a hex string
    const profile = `${profileSpace}${genProfileIDC}.${genProfileCompatibility}`;
    pieces.push(profile);

    // LEVEL = TIER LEVEL_IDC

    // TIER = "L" / "H" (general_tier_flag, 0=="L", 1=="H")
    const tier = genTierBit ? "H" : "L";
    const level = `${tier}${genLevelIDC}`;
    pieces.push(level);

    // CONSTRAINTS = 2(HEXDIG) [ "." CONSTRAINTS ] (hexadecimal representation of the general_constraint_indicator_flags. Each byte is separated by a '.', and trailing zero bytes may be omitted.)

    while(genConstraintFlags.length > 0 && genConstraintFlags.slice(-1)[0] === 0) {
      genConstraintFlags.pop();
    }
    const constraints = genConstraintFlags.map(x => x.toString(16)).join(".");
    pieces.push(constraints);

    return pieces.join(".");
  };

  return {
    codecDesc,
    decoderConfigAtom
  };
};

module.exports = {
  blueprint,
  New
};
