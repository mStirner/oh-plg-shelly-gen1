// Shelly Flood
// https://shelly-api-docs.shelly.cloud/gen1/#shelly-flood
// https://www.shelly.com/en/products/shop/shelly-flood

module.exports = (logger, [
    C_ENDPOINTS
]) => {
    return {

        init(device, settings, iface) {
            (async () => {

                let labels = [
                    "shelly=true",
                    `name=${settings.name}`,
                    `model=${settings.device.type}`,
                    "gen=1"
                ];

                let found = await C_ENDPOINTS.find({
                    device: device._id,
                    labels
                });

                if (found) {
                    return logger.debug(`Endpoint(s) for device ${device.name} exists`);
                }

                C_ENDPOINTS.add({
                    name: "Flood sensor",
                    device: device._id,
                    states: [{
                        name: "Alarm",
                        type: "boolean",
                        alias: "ALARM",
                        value: false
                    }],
                    labels
                }).then(() => {

                    logger.info(`Endpoints (Floodsensor) for device "${device.name}" created`);

                }).catch((err) => {

                    logger.error("Could not add endpoints", err);

                });

            })();
        },

        handle(endpoint, iface) {

        }

    };
};