"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Q = require("bluebird");
const _ = require("lodash");
const appolo_1 = require("appolo");
const modelFactory_1 = require("./modelFactory");
class BaseCrudManager extends appolo_1.EventDispatcher {
    getById(id, params = {}) {
        return this.findOne({ ...params, filter: { _id: id } });
    }
    async findOne(params = {}) {
        try {
            let query = this.model
                .findOne(params.filter || {});
            if (params.fields) {
                query.select(params.fields);
            }
            if (params.lean) {
                query.lean(params.lean);
            }
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                query.where('isDeleted', false);
            }
            if (params.populate) {
                query.populate(params.populate);
            }
            let item = await query.exec();
            return item;
        }
        catch (e) {
            this.logger.error(`failed to findOne ${this.constructor.name}`, { e, params });
            throw e;
        }
    }
    async getAll(params = {}) {
        try {
            let query = this.model.find({})
                .select(params.fields || {});
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                query.where('isDeleted', false);
            }
            let p1 = query.where(params.filter || {})
                .sort(params.sort || {})
                .populate(params.populate || [])
                .limit(params.pageSize || 0)
                .lean(params.lean)
                .skip((params.pageSize || 0) * ((params.page || 0) - 1))
                .exec();
            let promises = {
                results: p1,
                count: Promise.resolve(0)
            };
            if (params.pageSize > 0 && params.page > 0) {
                let query2 = this.model.find({});
                if (this.model[modelFactory_1.BaseCrudSymbol]) {
                    query2.where('isDeleted', false);
                }
                promises.count = query2.where(params.filter || {})
                    .countDocuments()
                    .exec();
            }
            let { results, count } = await Q.props(promises);
            return { results: results, count: count || results.length };
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to getAll`, { e, params });
            throw e;
        }
    }
    async findAll(options = {}) {
        try {
            let query = this.model
                .find(options.filter || {})
                .sort(options.sort || {})
                .lean(options.lean);
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                query.where('isDeleted', false);
            }
            if (options.populate) {
                query.populate(options.populate);
            }
            let items = await query.exec();
            return items;
        }
        catch (e) {
            this.logger.error(`failed to findAll ${this.constructor.name}`, { e });
            throw e;
        }
    }
    async create(data) {
        try {
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                let isActive = data.isActive;
                data = {
                    ...data,
                    created: Date.now(),
                    updated: Date.now(),
                    isActive: _.isBoolean(isActive) ? isActive : true,
                    isDeleted: false
                };
            }
            let model = new this.model(data);
            let doc = await model.save();
            return doc;
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to create`, { e, data });
            throw e;
        }
    }
    async updateById(id, data, options = {}) {
        try {
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                data = { updated: Date.now(), ...data };
            }
            options = { new: true, ...options };
            let doc = await this.model.findByIdAndUpdate(id, data, options)
                .exec();
            return doc;
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to update`, { e, data });
            throw e;
        }
    }
    async update(query, update, options) {
        try {
            if (!_.isPlainObject(query)) {
                return this.updateById(query, update, options);
            }
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                update = { updated: Date.now(), ...options };
            }
            await this.model.updateMany(query, update, options).exec();
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to updateMulti`, { e, query });
            throw e;
        }
    }
    async deleteById(id, hard) {
        try {
            if (this.model[modelFactory_1.BaseCrudSymbol] && !hard) {
                await this.updateById(id, { isDeleted: true, isActive: false });
            }
            else {
                await this.model.findByIdAndDelete(id).exec();
            }
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to deleteById`, { e, id });
            throw e;
        }
    }
    async delete(query, hard) {
        try {
            if (!_.isPlainObject(query)) {
                return this.deleteById(query, hard);
            }
            if (this.model[modelFactory_1.BaseCrudSymbol] && !hard) {
                await this.update(query, { isDeleted: true, isActive: false });
            }
            else {
                await this.model.deleteMany(query).exec();
            }
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to delete`, { e, query });
            throw e;
        }
    }
}
tslib_1.__decorate([
    appolo_1.inject(),
    tslib_1.__metadata("design:type", Object)
], BaseCrudManager.prototype, "logger", void 0);
exports.BaseCrudManager = BaseCrudManager;
//# sourceMappingURL=baseCrudManager.js.map