import { Jsonix } from "../Jsonix";
import * as fs from "node:fs";

Jsonix.Binding.Unmarshaller = Jsonix.Class(Jsonix.Binding.Unmarshalls.Element, Jsonix.Binding.Unmarshalls.Element.AsElementRef, {
    context: null,
    allowTypedObject: true,
    allowDom: false,
    initialize: function (context) {
        Jsonix.Util.Ensure.ensureObject(context);
        this.context = context;
    },
    unmarshalString: function (text) {
        Jsonix.Util.Ensure.ensureString(text);
        var doc = Jsonix.DOM.parse(text);
        return this.unmarshalDocument(doc);
    },
    unmarshalFile: function (fileName, callback, options) {
        Jsonix.Util.Ensure.ensureString(fileName);
        Jsonix.Util.Ensure.ensureFunction(callback);
        if (Jsonix.Util.Type.exists(options)) {
            Jsonix.Util.Ensure.ensureObject(options);
        }
        that = this;
        fs.readFile(fileName, options, function (err, data) {
            if (err) {
                throw err;
            } else {
                var text = data.toString();
                var doc = Jsonix.DOM.parse(text);
                callback(that.unmarshalDocument(doc));
            }
        });
    },
    unmarshalDocument: function (doc, scope) {
        var input = new Jsonix.XML.Input(doc);
        var result = null;
        var callback = function (_result) {
            result = _result;
        };
        input.nextTag();
        this.unmarshalElement(this.context, input, scope, callback);
        return result;
    },
    CLASS_NAME: "Jsonix.Binding.Unmarshaller",
});
Jsonix.Binding.Unmarshaller.Simplified = Jsonix.Class(Jsonix.Binding.Unmarshaller, Jsonix.Binding.Unmarshalls.Element.AsSimplifiedElementRef, {
    CLASS_NAME: "Jsonix.Binding.Unmarshaller.Simplified",
});
