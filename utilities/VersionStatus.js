// Retrieve part list from object
const Utility = require('./lib/Utility')

const ExistVer = require('./lib/concerns/ExistVer')

class VersionStatus extends Utility {
  blueprint() {
    return {
      concerns: [ExistVer]
    }
  }

  async body() {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(await this.concerns.ExistVer.status(),null,2))
  }

  header() {
    return `Get status of version ${this.args.versionHash}`
  }
}

if (require.main === module) {
  Utility.cmdLineInvoke(VersionStatus)
} else {
  module.exports = VersionStatus
}
