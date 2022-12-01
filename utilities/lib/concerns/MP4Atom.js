const R = require("ramda");

const {
  NonNegativeInteger,
  ObjectModel,
  PositiveInteger
} = require("../models/Models");

const Logger = require("./Logger");

const blueprint = {
  name: "MP4Atom",
  concerns: [Logger]
};

const New = context => {

  // const logger = context.concerns.Logger;

  class MP4AtomReadContext extends ObjectModel({
    buffer: Buffer,
    currentAtomLength: PositiveInteger,
    currentAtomStart: NonNegativeInteger,
    posWithinAtom: NonNegativeInteger
  })
    .assert(x => x.currentAtomLength >= 8, ()=>"currentAtomLength must be >= 8")
    .assert(x => x.posWithinAtom < x.currentAtomLength, ()=>"posWithinAtom must be < currentAtomLength")
    .assert(x => (x.currentAtomStart + x.currentAtomLength) <= x.buffer.length,()=> "currentAtomStart + currentAtomLength must be <= buffer.length")
  {

    get currentAtomBytesLeft() {
      return this.currentAtomLength - this.posWithinAtom;
    }

    get currentAtomEnd() {
      return this.currentAtomStart + this.currentAtomLength;
    }

    get currentBufPos() {
      return this.currentAtomStart + this.posWithinAtom;
    }
  }

  // enter atom under read head, then move read head past header (length and type fields)
  const enter = readContext => {
    let {atomType, atomLength, headerLength} = readHeader(readContext);
    // logger.log(`Entering atom '${atomType}', atom start = ${readContext.currentBufPos}, skipping ${headerLength} byte header`);
    return new MP4AtomReadContext(
      R.mergeRight(
        readContext,
        {
          currentAtomLength: atomLength,
          currentAtomStart: readContext.currentBufPos,
          currentAtomType: atomType,
          posWithinAtom: headerLength
        }
      )
    );
  };

  // Read atoms without entering, looking for particular atom atomType(s)
  // The read head must be at the start of any atom (reading the next 4 bytes must return the length field)
  const find = R.curry(
    (atomTypes, readContext) => {
      // logger.log(`Searching for atom of following type(s): ${atomTypes}, starting at buffer pos: ${readContext.currentBufPos}`);
      let eof = false;
      let found = false;
      while(!found && !eof) {
        let {atomType, atomLength} = readHeader(readContext);
        if(atomTypes.includes(atomType)) {
          // logger.log(`found atom '${atomType}' at atom offset: ${readContext.posWithinAtom} , buffer pos: ${readContext.currentBufPos}, length: ${atomLength}`);
          found = true;
        } else {
          // skip to next atom
          // logger.log(`skipping atom '${atomType}' at atom offset: ${readContext.posWithinAtom} , buffer pos: ${readContext.currentBufPos}`);
          readContext = moveWithin(atomLength, readContext);
          // check if we have run out of data
          if(readContext.posWithinAtom === readContext.currentAtomLength) eof = true;
        }
      }
      if(!found) throw Error(`Atom type(s) not found: ${atomTypes}`);

      return readContext;
    }
  );

  const findAndEnter = R.curry(R.pipe(find, enter));

  const moveWithin = R.curry(
    (offset, readContext) => {
      // logger.log(`Move within atom: ${offset} bytes`);

      const newPosWithinParent = readContext.posWithinAtom + offset;
      if(newPosWithinParent >= readContext.currentAtomLength) throw Error("Cannot move past end of atom");
      if(newPosWithinParent < 0) throw Error("Cannot move before beginning of atom");

      return new MP4AtomReadContext(R.mergeRight(readContext, {posWithinAtom: newPosWithinParent}));
    }
  );

  const newContextFromBuffer = buffer => {
    return new MP4AtomReadContext({
      buffer,
      currentAtomLength: buffer.length,
      currentAtomStart: 0,
      currentAtomType: "",
      posWithinAtom: 0
    });
  };

  const readAtom = readContext => {
    const {atomLength} = readHeader(readContext);
    const atomStart = readContext.currentBufPos;
    const atomEnd = atomStart + atomLength;
    // logger.log(`returning buffer subsegment: ${atomStart} - ${atomEnd}`);
    return readContext.buffer.subarray(atomStart, atomEnd);
  };

  const readHeader = readContext => {
    const {buffer, currentAtomBytesLeft, currentBufPos} = readContext;
    let headerLength = 8;

    if(currentAtomBytesLeft < headerLength) throw Error("Cannot read atom, not enough bytes available to hold atomLength + type fields");

    // logger.log(`reading atom info at buffer position: ${currentBufPos}`);

    // read 4 bytes to get atomLength
    let atomLength = buffer.readUInt32BE(currentBufPos);
    if(atomLength === 0 || (atomLength > 1 && atomLength < 8)) throw Error(`Invalid length 0 found: ${atomLength}`);
    // logger.log(`  length: ${atomLength}`);

    // read 4 bytes to get atom type
    const atomType = buffer.toString("ascii", currentBufPos + 4, currentBufPos + 8);
    // logger.log(`  type: ${atomType}`);

    // if atomLength === 1, need to read 8 more bytes to get 64-bit atomLength
    if(atomLength === 1) {
      headerLength = 16;
      if(currentAtomBytesLeft < headerLength) throw Error("Cannot read atom, not enough bytes available to hold 64-bit atomLength field");
      atomLength = buffer.readUInt64BE(currentBufPos + 8);
    }
    // logger.log(`  final length: ${atomLength}`);

    if(atomLength > currentAtomBytesLeft) {
      throw Error(`Invalid length found: ${atomLength} (only ${currentAtomBytesLeft} available)`);
    }

    return {atomLength, atomType, headerLength};
  };

  return {
    enter,
    find,
    findAndEnter,
    moveWithin,
    MP4AtomReadContext,
    newContextFromBuffer,
    readAtom,
    readHeader
  };
};

module.exports = {
  blueprint,
  New
};
