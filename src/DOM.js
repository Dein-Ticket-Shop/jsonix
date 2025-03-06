import { Jsonix } from "./Jsonix";
import * as xmldom from "@xmldom/xmldom";

Jsonix.DOM = {
    isDomImplementationAvailable: function () {
        return true;
    },
    createDocument: function () {
        return new xmldom.DOMImplementation().createDocument();
    },
    serialize: function (node) {
        Jsonix.Util.Ensure.ensureExists(node);
        return new xmldom.XMLSerializer().serializeToString(node);
    },
    parse: function (text) {
        Jsonix.Util.Ensure.ensureExists(text);
        return new xmldom.DOMParser().parseFromString(text, "application/xml");
    },
    load: function (url, callback, options) {
        var request = Jsonix.Request.INSTANCE;

        request.issue(
            url,
            function (transport) {
                var result;
                if (Jsonix.Util.Type.exists(transport.responseXML) && Jsonix.Util.Type.exists(transport.responseXML.documentElement)) {
                    result = transport.responseXML;
                } else if (Jsonix.Util.Type.isString(transport.responseText)) {
                    result = Jsonix.DOM.parse(transport.responseText);
                } else {
                    throw new Error("Response does not have valid [responseXML] or [responseText].");
                }
                callback(result);
            },
            function (transport) {
                throw new Error("Could not retrieve XML from URL [" + url + "].");
            },
            options
        );
    },
    xlinkFixRequired: null,
    isXlinkFixRequired: function () {
        if (Jsonix.DOM.xlinkFixRequired === null) {
            if (typeof navigator === "undefined") {
                Jsonix.DOM.xlinkFixRequired = false;
            } else if (!!navigator.userAgent && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
                var doc = Jsonix.DOM.createDocument();
                var el = doc.createElement("test");
                el.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "urn:test");
                doc.appendChild(el);
                var testString = Jsonix.DOM.serialize(doc);
                Jsonix.DOM.xlinkFixRequired = testString.indexOf("xmlns:xlink") === -1;
            } else {
                Jsonix.DOM.xlinkFixRequired = false;
            }
        }
        return Jsonix.DOM.xlinkFixRequired;
    },
};
