"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
exports.BaseCrudSymbol = Symbol("baseCrudSymbol");
class ModelFactory {
    get() {
        let model = this.schema.getModel(this.connection);
        if (__1.BaseCrudItem.prototype.isPrototypeOf(this.schema.prototype)) {
            Reflect.defineMetadata(exports.BaseCrudSymbol, model, model);
            model[exports.BaseCrudSymbol] = true;
        }
        return model;
    }
}
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=modelFactory.js.map