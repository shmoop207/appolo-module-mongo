"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TesRef = void 0;
const tslib_1 = require("tslib");
const index_1 = require("../../index");
var Test;
(function (Test) {
    Test["A"] = "aaa";
    Test[Test["B"] = 1] = "B";
    Test[Test["F"] = 2] = "F";
    Test["C"] = "11";
    Test["D"] = "111";
})(Test || (Test = {}));
let TesRef = class TesRef extends index_1.Schema {
};
(0, tslib_1.__decorate)([
    (0, index_1.prop)({ type: String, enum: Test }),
    (0, tslib_1.__metadata)("design:type", String)
], TesRef.prototype, "bla", void 0);
TesRef = (0, tslib_1.__decorate)([
    (0, index_1.model)(),
    (0, index_1.schema)("TesRef", { strict: true })
], TesRef);
exports.TesRef = TesRef;
//# sourceMappingURL=tesRef.js.map