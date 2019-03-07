"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const appolo_1 = require("appolo");
exports.ModelKey = Symbol("model");
exports.InjectModelKey = Symbol("injectModel");
function model(name) {
    return function (fn) {
        name = name || appolo_1.Util.getClassName(fn) + "Model";
        Reflect.defineMetadata(exports.ModelKey, name, fn);
    };
}
exports.model = model;
function injectModel(model) {
    return function (fn, propertyKey, descriptor) {
        let models = appolo_1.Util.getReflectData(exports.InjectModelKey, fn.constructor, []);
        models.push({ fn, propertyKey, model });
    };
}
exports.injectModel = injectModel;
//# sourceMappingURL=decorator.js.map