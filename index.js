const { EventEmitter } = require("events");

module.exports = (info, logger, init) => {
    return init([
        "devices",
        "endpoints",
        "mdns"
    ], (scope, [
        C_DEVICES,
        C_ENDPOINTS,
        C_MDNS
    ]) => {

        logger.warn("Hello from plugin", info.name, init);

        const events = new EventEmitter();

        require("./autodiscover.js")(logger, [
            C_DEVICES,
            C_MDNS
        ], events);


        require("./discover-endpoint.js")(logger, [
            C_ENDPOINTS
        ], events);


        require("./handle-commands.js")(logger, [
            C_ENDPOINTS,
            C_DEVICES
        ], events);

    });
};