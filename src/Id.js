// Incremental numerical IDs

let __id = 0;

class Id {
  static next(){
    __id++;
    return __id;
  }
}

module.exports = Id;
