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

            // replace this after fixing 352 with item.labels.value("model");
            let label = item?.labels.find((label) => {
                return label.match(/model=*./i);
            });

            let model = label.split("=")[1];

            console.log("Handle enpdoint", item.name, model)

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
