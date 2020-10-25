"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrudManager = void 0;
const tslib_1 = require("tslib");
const Q = require("bluebird");
const _ = require("lodash");
const __1 = require("../..");
const appolo_1 = require("appolo");
const modelFactory_1 = require("./modelFactory");
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
class BaseCrudManager {
    constructor() {
        this._itemCreatedEvent = new appolo_event_dispatcher_1.Event({ await: true });
        this._itemCreatedOrUpdatedEvent = new appolo_event_dispatcher_1.Event({ await: true });
        this._itemUpdatedEvent = new appolo_event_dispatcher_1.Event({ await: true });
    }
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
            let item = await model.save();
            await Promise.all([
                this._itemCreatedEvent.fireEvent({ item }),
                this._itemCreatedOrUpdatedEvent.fireEvent({ item })
            ]);
            return item;
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to create`, { e, data });
            throw e;
        }
    }
    async updateById(id, data, options = {}) {
        try {
            let previous = await this.getById(id);
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                data = { ...data, updated: Date.now() };
            }
            options = { new: true, ...options };
            await this.beforeUpdateById(id, data, previous);
            let item = await this.model.findByIdAndUpdate(id, data, options)
                .exec();
            await Promise.all([
                this._itemUpdatedEvent.fireEvent({ item, previous }),
                this._itemCreatedOrUpdatedEvent.fireEvent({ item: item, previous })
            ]);
            return item;
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to update`, { e, data });
            throw e;
        }
    }
    async updateByIdAndSave(id, data) {
        try {
            let previous = await this.getById(id);
            if (!previous) {
                throw new Error(`failed to find item for id ${id} ${this.constructor.name}`);
            }
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                data = { ...data, updated: Date.now() };
            }
            await this.beforeUpdateById(id, data, previous);
            let item = this.cloneDocument(previous);
            _.extend(item, data);
            await item.save();
            await Promise.all([
                this._itemUpdatedEvent.fireEvent({ item, previous }),
                this._itemCreatedOrUpdatedEvent.fireEvent({ item: item, previous })
            ]);
            return item;
        }
        catch (e) {
            this.logger.error(`${this.constructor.name} failed to update`, { e, data });
            throw e;
        }
    }
    beforeUpdateById(id, data, previous) {
    }
    async updateAll(query, update, options) {
        try {
            if (this.model[modelFactory_1.BaseCrudSymbol]) {
                update = { updated: Date.now(), ...update };
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
    async deleteAll(query, hard) {
        try {
            if (!_.isPlainObject(query)) {
                return this.deleteById(query, hard);
            }
            if (this.model[modelFactory_1.BaseCrudSymbol] && !hard) {
                await this.updateAll(query, { isDeleted: true, isActive: false });
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
    cloneDocument(doc) {
        let newDoc = new this.model(doc.toObject());
        return newDoc;
    }
    cloneNewDocument(doc) {
        let newDoc = this.cloneDocument(doc);
        newDoc._id = __1.mongoose.Types.ObjectId();
        return doc;
    }
    get itemCreatedEvent() {
        return this._itemCreatedEvent;
    }
    get itemCreatedOrUpdatedEvent() {
        return this._itemCreatedOrUpdatedEvent;
    }
    get itemUpdatedEvent() {
        return this._itemUpdatedEvent;
    }
}
tslib_1.__decorate([
    appolo_1.inject(),
    tslib_1.__metadata("design:type", Object)
], BaseCrudManager.prototype, "logger", void 0);
exports.BaseCrudManager = BaseCrudManager;
//# sourceMappingURL=baseCrudManager.js.map