// Shelly Flood
// https://shelly-api-docs.shelly.cloud/gen1/#shelly-rgbw2-color
// https://www.shelly.com/en/products/shop/shelly-rgbw2

const request = require("../../../helper/request.js");

module.exports = (logger, [
    C_ENDPOINTS
]) => {
    return {

        init(device, settings, iface) {

            let promises = settings.lights.map(async (light, i) => {

                let labels = [
                    "shelly=true",
                    `index=${i}`,
                    //`name=${settings.name}`,
                    `model=${settings.device.type}`,
                    `light=${light.name}`,
                    "gen=1"
                ];

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
                }, {
                    name: "Color",
                    alias: "COLOR",
                    interface: iface._id,
                    params: [{
                        key: "r",
                        type: "number",
                        min: 0,
                        max: 255
                    }, {
                        key: "g",
                        type: "number",
                        min: 0,
                        max: 255
                    }, {
                        key: "b",
                        type: "number",
                        min: 0,
                        max: 255
                    }]
                }];

                let found = await C_ENDPOINTS.find({
                    device: device._id,
                    labels
                });

                if (found) {
                    return Promise.resolve(found);
                }

                return C_ENDPOINTS.add({
                    name: light.name || `Light ${i}`,
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

        },

        handle(endpoint, iface) {
            try {

                console.log("endpointHandler", endpoint._id)

                let { host, port } = iface.settings;
                let agent = iface.httpAgent();
                //let relay = endpoint.labels.value("relay");
                let index = endpoint.labels.find((label) => {
                    return label.match(/index=*./i);
                }).split("=")[1];

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

                        request(`http://${host}:${port}/color/${index}?turn=${turn}`, {
                            agent
                        }, (err, result) => {

                            console.log(err || result, String(result.body), `http://${host}:${port}/color/${index}?turn=${turn}`);

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