const { warmCache: warmDevicesCache } = require("../../routes/Device/Device.cache")
const { warmCache: warmIntentsCache } = require("../../routes/Intents/Intent.cache")

const runFunctionsOnServerStartup = () => {
    warmDevicesCache();
    warmIntentsCache();

}

module.exports = { runFunctionsOnServerStartup };
