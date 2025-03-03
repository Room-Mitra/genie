const { warmCache } = require("../../routes/Device/Device.cache")

const runFunctionsOnServerStartup = () => {
    warmCache()
}

module.exports = { runFunctionsOnServerStartup };
