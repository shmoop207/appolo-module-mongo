"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrudItem = void 0;
const tslib_1 = require("tslib");
const index_1 = require("../../index");
class BaseCrudItem extends index_1.Schema {
}
(0, tslib_1.__decorate)([
    (0, index_1.prop)({ type: Boolean, default: false }),
    (0, tslib_1.__metadata)("design:type", Boolean)
], BaseCrudItem.prototype, "isActive", void 0);
(0, tslib_1.__decorate)([
    (0, index_1.prop)({ type: Boolean, default: false }),
    (0, tslib_1.__metadata)("design:type", Boolean)
], BaseCrudItem.prototype, "isDeleted", void 0);
(0, tslib_1.__decorate)([
    (0, index_1.prop)({ type: Number }),
    (0, tslib_1.__metadata)("design:type", Number)
], BaseCrudItem.prototype, "created", void 0);
(0, tslib_1.__decorate)([
    (0, index_1.prop)({ type: Number }),
    (0, tslib_1.__metadata)("design:type", Number)
], BaseCrudItem.prototype, "updated", void 0);
exports.BaseCrudItem = BaseCrudItem;
//# sourceMappingURL=baseCrudItem.js.map