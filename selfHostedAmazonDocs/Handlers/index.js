
const RequestHandlers = require("./RequestHandlers/index.js");
const ErrorHandlers = require("./ErrorHandlers/index.js");
const IntentHandlers = require("./IntentHandlers/index.js");

const Handlers = {
    RequestHandlers,
    ErrorHandlers,
    IntentHandlers
}

module.exports = Handlers;