"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Q = require("bluebird");
const _ = require("lodash");
const appolo_1 = require("appolo");
class BaseCrudManager {
    async getOne(id, fields, populate) {
        try {
            let item = await this.model.findById(id)
                .select(fields || {})
                .where('isDeleted', false)
                .populate(populate || [])
                .exec();
            return item;
        }
        catch (e) {
            this.logger.error(`failed to get ${this.constructor.name} ${id}`, { e });
            throw e;
        }
    }
    async findOne(filter, fields, populate) {
        try {
            let item = await this.model.findOne(filter)
                .select(fields || {})
                .where('isDeleted', false)
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
            let p1 = this.model.find({})
                .select(options.fields || {})
                .where('isDeleted', false)
                .where(options.filter || {})
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
    async create(data, ...args) {
        try {
            data.created = Date.now();
            data.updated = Date.now();
            data.isActive = _.isBoolean(data.isActive) ? data.isActive : true;
            data.isDeleted = false;
            let model = new this.model(data);
            let doc = await model.save();
            return doc;
        }
        catch (e) {
            this.logger.error(`failed to create ${this.constructor.name} ${JSON.stringify(data)}`, { e });
            throw e;
        }
    }
    async updateByModel(id, data, ...args) {
        try {
            data.updated = Date.now();
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
    async update(id, data, ...args) {
        try {
            let item = await this.getOne(id);
            if (!item) {
                throw new Error(`failed to find item for id ${id} ${this.constructor.name}`);
            }
            item.updated = Date.now();
            _.extend(item, data);
            await item.save();
            return item;
        }
        catch (e) {
            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, { e });
            throw e;
        }
    }
    async delete(id, ...args) {
        return this.update(id, { isDeleted: true, isActive: false }, args);
    }
    async updateMulti(query, update, ...args) {
        try {
            const items = await this.findAll(query);
            await Q.map(items, item => this.update(item._id, update, ...args), { concurrency: 20 });
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