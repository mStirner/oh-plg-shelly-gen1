module.exports = async (logger, [
    C_ENDPOINTS,
    C_DEVICES
], events) => {

    C_ENDPOINTS.found({
        labels: [
            "gen=1",
            "shelly=true"
        ]
    }, async (item) => {
        try {

            // fix for #352
            let model = item.labels.value("model");

            let { handle } = require(`./models/${model}.js`)(logger, [
                C_ENDPOINTS
            ]);

            let device = await C_DEVICES.find({
                _id: item.device
            });

            let iface = device.interfaces[0];

            handle(item, iface)

        } catch (err) {

            logger.error("Could not setup command handleing", err);

        }
    }, (filter) => {

        console.log("No item found for filter", filter);

    });



};
