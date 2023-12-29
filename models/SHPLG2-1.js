// Shelly Plug
// https://shelly-api-docs.shelly.cloud/gen1/#shelly-plug-plugs
// https://www.shelly.com/en/products/shop/shelly-plug

const request = require("../../../helper/request.js");

module.exports = (logger, [
    C_ENDPOINTS
]) => {
    return {

        init(device, settings, iface) {
            try {

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

                let states = [{
                    name: "On",
                    alias: "ON",
                    type: "boolean",
                    value: false
                }];

                let promises = settings.relays.map(async (relay, i) => {
                    try {

                        let labels = [
                            "shelly=true",
                            `index=${i}`,
                            //`name=${settings.name}`,
                            `model=${settings.device.type}`,
                            `relay=${i}`,
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
                            name: relay.name || `Relais ${i}`,
                            device: device._id,
                            commands,
                            states,
                            labels
                        });

                    } catch (err) {

                        logger.error("Could not map relay", err);

                    }
                });

                Promise.all(promises).then((endpoints) => {

                    logger.info(`Endpoints (${endpoints.length}) for device "${device.name}" created`);

                }).catch((err) => {

                    logger.error("Could not add endpoints", err);

                });


            } catch (err) {
                logger.error("Could not setup endpoint", err);
            }
        },

        handle(endpoint, iface) {
            try {

                let { host, port } = iface.settings;
                let agent = iface.httpAgent();

                let relay = endpoint.labels.value("index");

                endpoint.commands.forEach((command) => {
                    command.setHandler((cmd, _, params, done) => {

                        let turn = "off";

                        if (cmd.alias === "ON") {
                            turn = "on";
                        } else if (cmd.alias === "OFF") {
                            turn = "off";
                        } else {
                            logger.error("alias invalid");
                        }

                        console.log(relay,)

                        // `http://${host}:${port}/relay/${relay}/?turn=${turn}`
                        request(`http://${host}:${port}/relay/${relay}?turn=${turn}`, {
                            agent
                        }, (err, result) => {
                            done(err, result.body.ison ? turn == "on" : turn == "off");
                        });

                    });
                });

            } catch (err) {

                logger.error(err);

            }
        }

    };
};