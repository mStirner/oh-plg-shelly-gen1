// Shelly 2.5
// https://shelly-api-docs.shelly.cloud/gen1/#shelly2-5
// https://www.shelly.com/de/products/shop/1xs25

const request = require("../../../helper/request.js");

module.exports = (logger, [
    C_ENDPOINTS
], events) => {
    return {

        init(device, settings, iface) {
            try {

                if (settings.mode === "relay") {

                    let commands = [{
                        name: "On",
                        alias: "ON",
                        //icon: "fa-solid fa-power-off",
                        interface: iface._id
                    }, {
                        name: "Off",
                        alias: "OFF",
                        //icon: "fa-solid fa-power-off",
                        interface: iface._id
                    }];

                    let promises = settings.relays.map(async (relay, i) => {

                        let labels = [
                            "shelly=true",
                            "mode=relay",
                            `index=${i}`,
                            //`name=${settings.name}`,
                            `model=${settings.device.type}`
                        ];

                        let found = await C_ENDPOINTS.find({
                            device: device._id,
                            labels
                        });

                        if (found) {
                            return Promise.resolve(found);
                        }

                        return C_ENDPOINTS.add({
                            name: relay.name || `Relais ${i}`,
                            device: device._id,
                            commands
                        });

                    });

                    Promise.all(promises).then((endpoints) => {

                        logger.info(`Endpoints (${endpoints.length}) for device "${device.name}" created`);

                    }).catch((err) => {

                        logger.error("Could not add endpoints", err);

                    });

                } else if (settings.mode === "roller") {

                    let commands = [{
                        name: "Open",
                        alias: "OPEN",
                        interface: iface._id
                    }, {
                        name: "Close",
                        alias: "CLOSE",
                        interface: iface._id
                    }, {
                        name: "Stop",
                        alias: "STOP",
                        interface: iface._id
                    }];


                    let promises = settings.rollers.map(async (relay, i) => {

                        let labels = [
                            "shelly=true",
                            "mode=roller",
                            `index=${i}`,
                            //`name=${settings.name}`,
                            `model=${settings.device.type}`,
                            "gen=1"
                        ];

                        let found = await C_ENDPOINTS.find({
                            device: device._id,
                            labels
                        });

                        if (found) {
                            return Promise.resolve(found);
                        }

                        return C_ENDPOINTS.add({
                            name: relay.name || `Roller ${i}`,
                            device: device._id,
                            commands,
                            labels
                        });

                    });

                    Promise.all(promises).then((endpoints) => {

                        logger.info(`Endpoints (${endpoints.length}) for device "${device.name}" created`);

                    }).catch((err) => {

                        logger.error("Could not add endpoints", err);

                    });

                } else {
                    logger.error(`Device "${device.name}" invalid mode: ${settings.mode}`);
                }

            } catch (err) {
                logger.error(err);
            }
        },

        handle(endpoint, iface) {
            try {

                console.log("endpointHandler", endpoint._id)

                let { host, port } = iface.settings;
                let agent = iface.httpAgent();
                //let relay = endpoint.labels.value("relay");
                let mode = endpoint.labels.find((label) => {
                    return label.match(/mode=*./i);
                }).split("=")[1];

                let index = endpoint.labels.find((label) => {
                    return label.match(/index=*./i);
                }).split("=")[1];

                endpoint.commands.forEach((command) => {
                    command.setHandler((cmd, _, params, done) => {

                        console.log("Called setHandler")

                        let turn = "close";

                        if (cmd.alias === "OPEN") {
                            turn = "open";
                        } else if (cmd.alias === "CLOSE") {
                            turn = "close";
                        } else if (cmd.alias === "STOP") {
                            turn = "stop";
                        } else {
                            logger.error("alias invalid, set to stop");
                            turn = "stop";
                        }


                        // `http://${host}:${port}/relay/${relay}/?turn=${turn}`
                        request(`http://${host}:${port}/${mode}/${index}?go=${turn}`, {
                            agent
                        }, (err, result) => {

                            console.log(err || result, String(result.body), `http://${host}:${port}/${mode}/${index}?go=${turn}`);

                            done(result.body.state === turn)

                        });

                    });
                });

            } catch (err) {

                logger.error(err);

            }
        }

    };
};