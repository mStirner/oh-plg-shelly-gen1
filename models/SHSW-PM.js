// Shelly 1
// https://shelly-api-docs.shelly.cloud/gen1/#shelly1-shelly1pm
// https://www.shelly.com/en/products/shop/shelly-1

const request = require("../../../helper/request.js");

module.exports = (logger, [
    C_ENDPOINTS
]) => {
    return {

        init(device, settings, iface) {

            console.log(".adsfasdfasdf..........asdfasdfa..adsfadsf.......add endpoints for devce", device.name, settings)

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
                        //`name=${settings.name}`, // name = null
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
                        name: relay.name || `Relais ${i}`,
                        device: device._id,
                        commands,
                        labels
                    });

                });

                Promise.all(promises).then((endpoints) => {

                    logger.info(`Endpoints (${endpoints.length}) for device "${device.name}" created`, endpoints[0]);

                }).catch((err) => {

                    logger.error("Could not add endpoints", err);

                });

            } else {
                logger.error(`Device "${device.name}" invalid mode: ${settings.mode}`);
            }

        },

        handle(endpoint, iface) {
            try {

                console.log("endpointHandler", endpoint._id)

                let { host, port } = iface.settings;
                let agent = iface.httpAgent();
                //let relay = endpoint.labels.value("relay");
                let relay = endpoint.labels.find((label) => {
                    return label.match(/index=*./i);
                }).split("=")[1];

                endpoint.commands.forEach((command) => {
                    command.setHandler((cmd, _, params, done) => {

                        console.log("Called setHandler")

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

                            console.log(err || result, String(result.body), `http://${host}:${port}/relay/${relay}?turn=${turn}`);

                            done(result.body.ison ? turn == "on" : turn == "off")

                        });

                    });
                });

            } catch (err) {

                logger.error(err);

            }
        }

    };
};