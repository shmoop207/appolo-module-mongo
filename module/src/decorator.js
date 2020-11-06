"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = exports.InjectModelKey = exports.ModelKey = void 0;
require("reflect-metadata");
const utils_1 = require("@appolo/utils");
exports.ModelKey = Symbol("model");
exports.InjectModelKey = Symbol("injectModel");
function model(name) {
    return function (fn, propertyKey, descriptor) {
        if (propertyKey) {
            return injectModel(name)(fn, propertyKey, descriptor);
        }
        name = name || utils_1.Classes.className(fn) + "Model";
        Reflect.defineMetadata(exports.ModelKey, name, fn);
    };
}
exports.model = model;
function injectModel(model) {
    return function (fn, propertyKey, descriptor) {
        let models = utils_1.Reflector.getFnMetadata(exports.InjectModelKey, fn.constructor, []);
        models.push({ fn, propertyKey, model });
    };
}
//# sourceMappingURL=decorator.js.map