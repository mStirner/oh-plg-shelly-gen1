const Label = require("./class.label.js");

console.clear();


const LABELS = [
    "gen=3",
    "foo=bar",
    "bar=baz",
    "baz=true",
    "shelly=true",
    "gen=*",
    "version=3.1",
    "version=1.1",
    "*=mozart",
    "*=*",
    "gen=1",
    "gen=2",
    "oh:bridge_mode=trunced",
    "oh:bridge_target=657c3f77cbb049936c791c28"
].map((label) => {
    return new Label(label);
});




class Labels {

    constructor(arr = []) {
        Object.defineProperty(this, "store", {
            value: arr,
            enumerable: false,
            writable: false,
            configurable: false
        });
    }

    value(key) {
        return this.store.find((label) => {
            return label.key === key;
        })?.value;
    }

    key(value) {
        return this.store.find((label) => {
            return label.value === value;
        })?.key;
    }

    has(key) {
        return !!this.store.find((label) => {
            return label.key === key;
        });
    }

    get(i) {
        return this.store[i];
    }

    set(i, value) {
        return this.store[i] = value;
    }

    filter(query) {

        let [k, v] = query.split("=");

        return Array.prototype.filter.call(this.store, (label) => {

            if (k !== "*") {
                return label.key === k;
            }

            if (v !== "*") {
                return label.value === v;
            }

            return label.key === k && label.value === v;

        });

    }

    toJSON() {
        return this.store.map(({ key, value }) => {
            return `${key}=${value}`
        });
    }

}


const labels = new Labels(LABELS);
console.log(JSON.stringify(labels))



//console.log(labels.has("shelly"))

console.log(labels);


//const filterd = labels.filter("gen=*");
//console.log("filterd:", JSON.parse(JSON.stringify(filterd)));






console.log(JSON.stringify(labels))


//console.log(labels)


/*
const l1 = new Label("foo=bar");
const l2 = new Label("bar=baz");
const l3 = new Label("baz=true");


console.log(JSON.stringify({
    labels: [
        l1,
        l2,
        l3
    ]
}));


l1.value = "foobarbaz"
l3.key = "fuck";


console.log(JSON.stringify({
    labels: [
        l1,
        l2,
        l3
    ]
}));
*/