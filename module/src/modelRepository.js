"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose = require("mongoose");
const appolo_1 = require("appolo");
let ModelRepository = class ModelRepository {
    get connection() {
        return this.client;
    }
    getModel(model) {
        let modelName = model.collectionName;
        return this.models[modelName];
    }
};
tslib_1.__decorate([
    appolo_1.inject(),
    tslib_1.__metadata("design:type", mongoose.Connection)
], ModelRepository.prototype, "client", void 0);
tslib_1.__decorate([
    appolo_1.injectAlias("IModels", "modelName"),
    tslib_1.__metadata("design:type", Array)
], ModelRepository.prototype, "models", void 0);
ModelRepository = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], ModelRepository);
exports.ModelRepository = ModelRepository;
//# sourceMappingURL=modelRepository.js.map