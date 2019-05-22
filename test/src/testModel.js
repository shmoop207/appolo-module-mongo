"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    index_1.prop({ type: String })
], Test.prototype, "name", void 0);
tslib_1.__decorate([
    index_1.prop(testNested_1.TestNested)
], Test.prototype, "nested", void 0);
tslib_1.__decorate([
    index_1.prop({ ref: tesRef_1.TesRef })
], Test.prototype, "testRef", void 0);
tslib_1.__decorate([
    index_1.prop([{ ref: tesRef_1.TesRef }])
], Test.prototype, "testRefArr", void 0);
tslib_1.__decorate([
    index_1.virtual()
], Test.prototype, "setName", null);
tslib_1.__decorate([
    index_1.method()
], Test.prototype, "setName2", null);
tslib_1.__decorate([
    index_1.pre("save")
], Test.prototype, "preSave", null);
tslib_1.__decorate([
    index_1.staticMethod()
], Test, "setName3", null);
Test = tslib_1.__decorate([
    index_1.model(),
    index_1.schema("Test", { strict: true })
], Test);
exports.Test = Test;
//# sourceMappingURL=testModel.js.map