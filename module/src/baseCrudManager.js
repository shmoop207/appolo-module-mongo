"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Q = require("bluebird");
const _ = require("lodash");
const appolo_1 = require("appolo");
const modelFactory_1 = require("./modelFactory");
class BaseCrudManager {
    async getOne(id, fields, populate) {
        try {
            let query = this.model.findById(id)
                .select(fields || {});
            if (this.model.schema.obj.isDeleted) {
                query.where('isDeleted', false);
            }
            let item = await query.populate(populate || []).exec();
            return item;
        }
        catch (e) {
            this.logger.error(`failed to get ${this.constructor.name} ${id}`, { e });
            throw e;
        }
    }
    async findOne(filter, fields, populate) {
        try {
            let query = this.model.findOne(filter)
                .select(fields || {});
            if (this.model.schema.obj.isDeleted) {
                query.where('isDeleted', false);
            }
            let item = await query.where('isDeleted', false)
                .populate(populate || [])
                .exec();
            return item;
        }
        catch (e) {
            this.logger.error(`failed to findOne ${filter} ${this.constructor.name}`, { e });
            throw e;
        }
    }
    async getAll(options = {}) {
        try {
            let query = this.model.find({})
                .select(options.fields || {});
            if (this.model.schema.obj.isDeleted) {
                query.where('isDeleted', false);
            }
            let p1 = query.where(options.filter || {})
                .sort(options.sort || {})
                .populate(options.populate || [])
                .limit(options.pageSize || 0)
                .lean(options.lean)
                .skip((options.pageSize || 0) * ((options.page || 0) - 1))
                .exec();
            let promises = {
                results: p1,
                count: Promise.resolve(0)
            };
            if (options.pageSize > 0 && options.page > 0) {
                promises.count = this.model
                    .where('isDeleted', false)
                    .where(options.filter || {})
                    .countDocuments()
                    .exec();
            }
            let { results, count } = await Q.props(promises);
            return { results: results, count: count || results.length };
        }
        catch (e) {
            this.logger.error(`failed to getAll ${this.constructor.name} ${JSON.stringify(options)}`, { e });
            throw e;
        }
    }
    async findAll(filter, populate) {
        try {
            let items = await this.model
                .find(filter)
                .where('isDeleted', false)
                .populate(populate || []).exec();
            return items;
        }
        catch (e) {
            this.logger.error(`failed to findAll ${this.constructor.name}`, { e });
            throw e;
        }
    }
    async create(data) {
        try {
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                let crud = data;
                crud.created = Date.now();
                crud.updated = Date.now();
                crud.isActive = _.isBoolean(crud.isActive) ? crud.isActive : true;
                crud.isDeleted = false;
            }
            let model = new this.model(data);
            let doc = await model.save();
            return doc;
        }
        catch (e) {
            this.logger.error(`failed to create ${this.constructor.name} ${JSON.stringify(data)}`, { e });
            throw e;
        }
    }
    async updateByIdAndModel(id, data) {
        try {
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                data.updated = Date.now();
            }
            let updateData = _.has(data, '$set') ? data : { $set: data };
            let doc = await this.model.findByIdAndUpdate(id, updateData, { new: true })
                .exec();
            return doc;
        }
        catch (e) {
            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, { e });
            throw e;
        }
    }
    async updateById(id, data) {
        try {
            let item = await this.getOne(id);
            if (!item) {
                throw new Error(`failed to find item for id ${id} ${this.constructor.name}`);
            }
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                data.updated = Date.now();
            }
            _.extend(item, data);
            await item.save();
            return item;
        }
        catch (e) {
            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, { e });
            throw e;
        }
    }
    async deleteById(id) {
        if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
            return this.updateByIdAndModel(id, { isDeleted: true, isActive: false });
        }
        else {
            return this.deleteHardById(id);
        }
    }
    async deleteHardById(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
    async updateMany(query, update) {
        try {
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                update.updated = Date.now();
            }
            let updateData = _.has(update, '$set') ? update : { $set: update };
            await this.model.updateMany(query, updateData).exec();
        }
        catch (e) {
            this.logger.error(`failed to updateMulti ${this.constructor.name}`, { e });
        }
    }
}
tslib_1.__decorate([
    appolo_1.inject()
], BaseCrudManager.prototype, "logger", void 0);
exports.BaseCrudManager = BaseCrudManager;
//# sourceMappingURL=baseCrudManager.js.map