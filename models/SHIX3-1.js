// Shelly i3
// https://shelly-api-docs.shelly.cloud/gen1/#shelly-i3
//

module.exports = (logger, [
    C_ENDPOINTS
]) => {
    return {

        init(device, settings, iface) {

            let promises = settings.inputs.map(async (input, i) => {

                let labels = [
                    "shelly=true",
                    `index=${i}`,
                    //`name=${settings.name}`,
                    `model=${settings.device.type}`,
                    `input=${input.name}`,
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
                    name: input.name || `Input ${i}`,
                    device: device._id,
                    states: [{
                        name: "Active",
                        type: "boolean",
                        alias: "ACTIVE",
                        value: false
                    }],
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

        }

    };
};