// Shelly Flood
// https://shelly-api-docs.shelly.cloud/gen1/#shelly-rgbw2-color
// https://www.shelly.com/en/products/shop/shelly-rgbw2
const { URLSearchParams } = require("url");

const request = require("../../../helper/request.js");
const { hueToRgb } = require("../../../helper/colors.js");

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
                        key: "color",
                        type: "number",
                        min: 0,
                        max: 360,
                        classes: ["hue-fader"]
                    }, {
                        key: "brightness",
                        type: "number",
                        min: 0,
                        max: 100,
                        classes: ["brightness-fader"]
                    }, {
                        key: "saturation",
                        type: "number",
                        min: 0,
                        max: 100,
                        classes: ["saturation-fader"]
                    }/*{
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
                    }*/]
                }, {
                    name: "Gain",
                    alias: "GAIN",
                    interface: iface._id,
                    params: [{
                        key: "gain",
                        type: "number",
                        min: 0,
                        max: 100
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

                let { host, port } = iface.settings;
                let agent = iface.httpAgent();

                let index = endpoint.labels.value("index");

                endpoint.commands.forEach((command) => {
                    command.setHandler((cmd, _, params, done) => {

                        let qs = new URLSearchParams();
                        qs.set("turn", "off");

                        if (cmd.alias === "ON") {

                            qs.set("turn", "on");

                        } else if (cmd.alias === "OFF") {

                            qs.set("turn", "off");

                        } else if (cmd.alias === "COLOR") {

                            let { color = 0, saturation = 100, brightness = 100 } = params.lean();
                            let [r, g, b] = hueToRgb(color, saturation, brightness);

                            //qs.set("gain", 1);
                            qs.set("turn", "on");
                            qs.set("red", r);
                            qs.set("green", g);
                            qs.set("blue", b);

                        } else if (cmd.alias === "GAIN") {

                            let { gain = 100 } = params.lean();

                            qs.set("turn", "on");
                            qs.set("gain", gain);

                        } else {

                            logger.error("alias invalid", cmd.alias);

                        }

                        // `http://${host}:${port}/color/${index}?turn=${turn}&red=${r}&green=${g}&blue=${b}`
                        let url = `http://${host}:${port}/color/${index}?${qs.toString()}`;

                        logger.verbose("URL", url);

                        request(url, {
                            agent
                        }, (err, result) => {

                            // TODO check body result
                            //let body = result.body;
                            done(err, result?.status === 200);

                        });

                    });
                });

            } catch (err) {

                logger.error(err);

            }
        }

    };
};
