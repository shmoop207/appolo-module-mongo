"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const testModel_1 = require("./testModel");
const index_1 = require("../../index");
let SomeManager = class SomeManager {
    test() {
    }
};
tslib_1.__decorate([
    index_1.injectModel(testModel_1.Test)
], SomeManager.prototype, "testModel", void 0);
SomeManager = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], SomeManager);
exports.SomeManager = SomeManager;
//# sourceMappingURL=someManager.js.map