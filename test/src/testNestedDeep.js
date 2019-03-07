"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../index");
let TestNestedDeep = class TestNestedDeep extends index_1.Schema {
};
tslib_1.__decorate([
    index_1.prop({ type: String })
], TestNestedDeep.prototype, "deep", void 0);
TestNestedDeep = tslib_1.__decorate([
    index_1.schema("TestNestedDeep", { strict: true })
], TestNestedDeep);
exports.TestNestedDeep = TestNestedDeep;
//# sourceMappingURL=testNestedDeep.js.map