"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("../../index");
class BaseCrudItem extends index_1.Schema {
}
tslib_1.__decorate([
    index_1.prop({ type: Boolean, default: false })
], BaseCrudItem2.prototype, "isActive", void 0);
tslib_1.__decorate([
    index_1.prop({ type: Boolean, default: false })
], BaseCrudItem2.prototype, "isDeleted", void 0);
tslib_1.__decorate([
    index_1.prop({ type: Number })
], BaseCrudItem2.prototype, "created", void 0);
tslib_1.__decorate([
    index_1.prop({ type: Number })
], BaseCrudItem2.prototype, "updated", void 0);
exports.BaseCrudItem2 = BaseCrudItem2;
//# sourceMappingURL=BaseCrudItem2.js.map
