const request = require("../../helper/request.js");

module.exports = (logger, [
    C_ENDPOINTS
], events) => {


    events.on("discover-endpoints", (device, agent) => {
        try {

            logger.verbose("Device added & fetch endpoints!---------------------------------", device.name)

            // NOTE: This throws error when typo interfaces[0] = interface[0]
            // Cannot read properties of undefined (reading '0')
            // See autodiscover.js
            let interface = device.interfaces[0];
            let { host, port } = interface.settings;
            let agent = interface.httpAgent();



            console.log(device.name, host, port)

            setTimeout(() => {

                console.log(`http://${host}:${port}/settings...`);

                request(`http://${host}:${port}/settings`, {
                    agent
                }, async (err, result) => {
                    if (err) {

                        // NOTE: Autodelete device here?
                        logger.warn(`Could not fetch http://${host}:${port}/settings.`, err);

                    } else {
                        try {

                            console.log("Fetched settings", host, port, device.name, result.body.device);

                            let { init } = require(`./models/${result.body.device.type}.js`)(logger, [
                                C_ENDPOINTS
                            ], events);

                            init(device, result.body, interface);

                        } catch (err) {
                            if (err.code === "MODULE_NOT_FOUND") {

                                logger.warn(`Device model "${result.body.device.type}" not implemented`);

                            } else {

                                logger.error("Could not load model handler", err);

                            }
                        }
                    }
                });

            }, 100);

        } catch (err) {
            logger.error("Fetch endpoints fucked", err);
        }
    });

    /*
    events.on("discover-endpoints", (device, agent) => {

        // NOTE: This throws error when typo interfaces[0] = interface[0]
        // Cannot read properties of undefined (reading '0')
        // See autodiscover.js
        let interface = device.interfaces[0];
        let { host, port } = interface.settings;


        request(`http://${host}:${port}/settings`, {
            agent
        }, async (err, result) => {
            if (err) {

                // NOTE: Autodelete device here?
                logger.warn(`Could not fetch http://${host}:${port}/settings.`, err);

            } else {
                try {

                    console.log("Fetched settings", host, port);

                    let { init } = require(`./models/${result.body.device.type}.js`)(logger, [
                        C_ENDPOINTS
                    ], events);

                    init(device, result.body);

                } catch (err) {
                    if (err.code === "MODULE_NOT_FOUND") {

                        logger.warn(`Device model "${result.body.device.type}" not implemented`);

                    } else {

                        logger.error("Could not load model handler", err);

                    }
                }
            }
        });

    });
    */

};