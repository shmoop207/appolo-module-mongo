"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRepository = void 0;
const tslib_1 = require("tslib");
const mongoose = require("mongoose");
const inject_1 = require("@appolo/inject");
let ModelRepository = class ModelRepository {
    get connection() {
        return this.client;
    }
    getModel(model) {
        let modelName = model.collectionName;
        return this.models[modelName];
    }
};
(0, tslib_1.__decorate)([
    (0, inject_1.inject)(),
    (0, tslib_1.__metadata)("design:type", mongoose.Connection)
], ModelRepository.prototype, "client", void 0);
(0, tslib_1.__decorate)([
    (0, inject_1.alias)("IModels", "modelName"),
    (0, tslib_1.__metadata)("design:type", Array)
], ModelRepository.prototype, "models", void 0);
ModelRepository = (0, tslib_1.__decorate)([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], ModelRepository);
exports.ModelRepository = ModelRepository;
//# sourceMappingURL=modelRepository.js.map