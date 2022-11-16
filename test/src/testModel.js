"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const tslib_1 = require("tslib");
const testNested_1 = require("./testNested");
const tesRef_1 = require("./tesRef");
const index_1 = require("../../index");
let Test = class Test extends index_1.BaseCrudItem {
    set setName(name) {
        this.name += name;
    }
    setName2(name) {
        this.save += name;
    }
    static setName3(name) {
        return this.findById(name);
    }
    preSave() {
    }
};
tslib_1.__decorate([
    (0, index_1.prop)({ type: String }),
    tslib_1.__metadata("design:type", String)
], Test.prototype, "name", void 0);
tslib_1.__decorate([
    (0, index_1.prop)(testNested_1.TestNested),
    tslib_1.__metadata("design:type", testNested_1.TestNested)
], Test.prototype, "nested", void 0);
tslib_1.__decorate([
    (0, index_1.propArray)(testNested_1.TestNested),
    tslib_1.__metadata("design:type", Array)
], Test.prototype, "nestedArr", void 0);
tslib_1.__decorate([
    (0, index_1.prop)({ ref: tesRef_1.TesRef }),
    tslib_1.__metadata("design:type", Object)
], Test.prototype, "testRef", void 0);
tslib_1.__decorate([
    (0, index_1.prop)([{ ref: tesRef_1.TesRef }]),
    tslib_1.__metadata("design:type", Object)
], Test.prototype, "testRefArr", void 0);
tslib_1.__decorate([
    (0, index_1.virtual)(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [Object])
], Test.prototype, "setName", null);
tslib_1.__decorate([
    (0, index_1.method)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], Test.prototype, "setName2", null);
tslib_1.__decorate([
    (0, index_1.pre)("save"),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], Test.prototype, "preSave", null);
tslib_1.__decorate([
    (0, index_1.staticMethod)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], Test, "setName3", null);
Test = tslib_1.__decorate([
    (0, index_1.model)(),
    (0, index_1.schema)("Test", { strict: true })
], Test);
exports.Test = Test;
//# sourceMappingURL=testModel.js.map