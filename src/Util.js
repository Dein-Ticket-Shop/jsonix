import { Jsonix } from "./Jsonix";

Jsonix.Util = {};

Jsonix.Util.extend = function (destination, source) {
    destination = destination || {};
    if (source) {
        /*jslint forin: true */
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }
    }
    return destination;
};
