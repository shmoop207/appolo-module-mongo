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
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
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
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
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
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
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
            let query = this.model
                .find(filter);
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                query.where('isDeleted', false);
            }
            let items = await query.where('isDeleted', false)
                .populate(populate || [])
                .exec();
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
    async updateById(id, data, options) {
        try {
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                data.updated = Date.now();
            }
            let doc = await this.model.findByIdAndUpdate(id, data, { new: true })
                .exec();
            return doc;
        }
        catch (e) {
            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, { e });
            throw e;
        }
    }
    async update(query, update) {
        try {
            if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model)) {
                update.updated = Date.now();
            }
            await this.model.updateMany(query, update).exec();
        }
        catch (e) {
            this.logger.error(`failed to updateMulti ${this.constructor.name}`, { e });
        }
    }
    async deleteById(id, hard) {
        if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model) && !hard) {
            return this.updateById(id, { isDeleted: true, isActive: false });
        }
        else {
            return this.model.findByIdAndDelete(id).exec();
        }
    }
    async delete(query, hard) {
        if (Reflect.hasMetadata(modelFactory_1.BaseCrudSymbol, this.model) && !hard) {
            await this.update(query, { isDeleted: true, isActive: false });
        }
        else {
            await this.model.deleteMany(query).exec();
        }
    }
}
tslib_1.__decorate([
    appolo_1.inject()
], BaseCrudManager.prototype, "logger", void 0);
exports.BaseCrudManager = BaseCrudManager;
//# sourceMappingURL=baseCrudManager.js.map