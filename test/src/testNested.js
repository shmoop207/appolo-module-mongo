"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const testNestedDeep_1 = require("./testNestedDeep");
const index_1 = require("../../index");
let TestNested = class TestNested extends testNestedDeep_1.TestNestedDeep {
};
tslib_1.__decorate([
    index_1.prop({ type: String })
], TestNested.prototype, "name", void 0);
TestNested = tslib_1.__decorate([
    index_1.schema("TestNested", { strict: true })
], TestNested);
exports.TestNested = TestNested;
//# sourceMappingURL=testNested.js.map