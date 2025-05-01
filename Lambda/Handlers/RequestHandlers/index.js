
const { LaunchRequestHandler } = require("./LaunchRequestHandler.js");
const { SessionEndedRequestHandler } = require("./SessionEndedRequestHandler.js");

const RequestHandlers = {
    LaunchRequestHandler,
    SessionEndedRequestHandler
};

module.exports = RequestHandlers;