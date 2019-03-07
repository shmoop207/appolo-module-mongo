"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ModelFactory {
    get() {
        return this.schema.getModel(this.connection);
    }
}
exports.ModelFactory = ModelFactory;
//# sourceMappingURL=modelFactory.js.map