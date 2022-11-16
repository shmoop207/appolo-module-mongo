"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SomeManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const testModel_1 = require("./testModel");
const index_1 = require("../../index");
let SomeManager = class SomeManager extends index_1.BaseCrudManager {
    test() {
    }
};
tslib_1.__decorate([
    (0, index_1.model)(testModel_1.Test),
    tslib_1.__metadata("design:type", Object)
], SomeManager.prototype, "model", void 0);
SomeManager = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], SomeManager);
exports.SomeManager = SomeManager;
//# sourceMappingURL=someManager.js.map