const request = require("../../helper/request.js");

module.exports = (logger, [
    C_DEVICES,
    C_MDNS
], events) => {


    // listen for new added devices
    // fetch /shelly from device & update labels
    C_DEVICES.found({
        labels: [
            "shelly=true",
            "gen=undefined",
            "needs-config=true"
        ]
    }, (device) => {

        logger.info(`Shelly device ${device.name} added`);

        // NOTE: This does *not* throws error when typo interfaces[0] = interface[0]
        // See discover-endpoint.js
        let interface = device.interfaces[0];
        let { host, port } = interface.settings;
        let agent = interface.httpAgent();

        //interface.once("attached", () => {

            // do request to unprotected /shelly endpoint
            // check if authenticiation is needed
            // any other request to a shelly device possible needs a password
            // TODO: add authentication stuffs
            request(`http://${host}:${port}/shelly`, {
                agent
            }, async (err, result) => {
                if (err) {

                    // NOTE: Autodelete device here?
                    logger.warn(`Could not fetch http://${host}:${port}/shelly. Please delete device and try again`, err);

                } else {
                    try {

                        logger.debug(`Fetched http://${host}:${port}/shelly (${device.name})`);

                        let {
                            gen = 1,
                            auth = false,
                            //mac = null,
                            type = null,
                            //name = null
                        } = result.body;

                        if (gen > 1) {
                            return logger.debug(`Device "${device.name}" is not a generation 1 device`);
                        }

                        // TODO format properly
                        //interface.mac = mac;

                        let labels = [
                            "shelly=true",
                            `gen=${gen}`,
                            `auth=${auth}`,
                            `type=${type}`,
                            //`name=${name}`
                        ];

                        logger.debug(`Update device labels with informations from http://${host}:${port}/shelly`, labels);

                        await C_DEVICES.update(device._id, {
                            interfaces: [
                                interface
                            ],
                            labels
                        });

                        // NOTE: why are here 3sec timeout needed?
                        // if this is removed or replaced with a process.nextTick(...) nothing works...
                        // Could it be that the update call above & the connector are to slow for the following http request?
                        setTimeout(() => {
                            events.emit("discover-endpoints", device, agent);
                        }, 3000);

                    } catch (err) {

                        logger.error("Could not update deivce", err);

                    }
                }
            });

        //});

    });


    // listen for mdns messages
    // add new device if not allread done
    C_MDNS.found({
        name: "shelly*.local",
        type: "A"
    }, (record) => {

        record.match(async ({ data, name }) => {

            //logger.verbose("DNS Record published", record, data);

            let exists = await C_DEVICES.find({
                interfaces: [{
                    settings: {
                        host: data,
                        port: 80
                    }
                }]
            });


            if (exists) {
                return logger.verbose(`Device with ip/host ${data} allready exists`);
            }

            await C_DEVICES.add({
                name,
                interfaces: [{
                    settings: {
                        host: data,
                        port: 80
                    }
                }],
                labels: [
                    "shelly=true",
                    "gen=undefined",
                    "needs-config=true"
                ]
            });

        });

    }, async (filter) => {
        try {

            let record = await C_MDNS.add(filter);
            logger.verbose(`mdns recourd added`, record);

        } catch (err) {

            logger.error("Could not add mdns record", err);

        }
    });

};
