"use strict";
import Q = require('bluebird');
import _ = require('lodash');
import {BaseCrudItem, mongoose, Schema} from "../..";
import {Doc, Model} from "appolo-mongo";
import {inject, EventDispatcher} from "appolo";
import {ILogger} from "@appolo/logger";
import {IBaseCrudItem, CrudItemParams, GetAllParams} from "./interfaces";
import {BaseCrudSymbol} from "./modelFactory";
import {ModelUpdateOptions, Query, QueryFindOneAndUpdateOptions} from "mongoose";


export abstract class BaseCrudManager<K extends Schema> extends EventDispatcher {

    @inject() protected logger: ILogger;

    protected abstract get model(): Model<K>

    public getById(id: string, params: Pick<GetAllParams<K>, "fields" | "populate" | "lean"> = {}): Promise<Doc<K>> {

        return this.findOne({...params, filter: {_id: id} as any});
    }

    public async findOne(params: Pick<GetAllParams<K>, "filter" | "fields" | "populate" | "lean"> = {}): Promise<Doc<K>> {

        try {

            let query = this.model
                .findOne(params.filter || {});

            if (params.fields) {
                query.select(params.fields);
            }

            if (params.lean) {
                query.lean(params.lean);
            }

            if (this.model[BaseCrudSymbol]) {
                query.where('isDeleted', false)
            }

            if (params.populate) {
                query.populate(params.populate)
            }

            let item = await query.exec();

            return item;

        } catch
            (e) {
            this.logger.error(`failed to findOne ${this.constructor.name}`, {e, params});

            throw e;
        }
    }

    public async getAll(params: GetAllParams<Partial<K>> = {}): Promise<{ results: Doc<K> [], count: number }> {

        try {
            let query = this.model.find({})
                .select(params.fields || {});

            if (this.model[BaseCrudSymbol]) {
                query.where('isDeleted', false)
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

                if (this.model[BaseCrudSymbol]) {
                    query2.where('isDeleted', false)
                }

                promises.count = query2.where(params.filter || {})
                    .countDocuments()
                    .exec();
            }

            let {results, count} = await Q.props(promises);

            return {results: results as Doc<K>[], count: count || (results as Doc<K>[]).length};
        } catch
            (e) {
            this.logger.error(`${this.constructor.name} failed to getAll`, {e, params});

            throw e;
        }
    }

    public async findAll(options: Omit<GetAllParams<Partial<K>>, "page" | "pageSize"> = {}): Promise<Doc<K> []> {

        try {

            let query: Query<Doc<K>[]> = this.model
                .find(options.filter || {})
                .sort(options.sort || {})
                .lean(options.lean);

            if (this.model[BaseCrudSymbol]) {
                query.where('isDeleted', false)
            }

            if (options.populate) {
                query.populate(options.populate)
            }

            let items = await query.exec();

            return items;

        } catch
            (e) {
            this.logger.error(`failed to findAll ${this.constructor.name}`, {e});

            throw e;
        }
    }

    public async create(data: Partial<K>): Promise<Doc<K>> {

        try {

            if (this.model[BaseCrudSymbol]) {

                let isActive = (data as K & BaseCrudItem).isActive;

                data = {
                    ...data,
                    created: Date.now(),
                    updated: Date.now(),
                    isActive: _.isBoolean(isActive) ? isActive : true,
                    isDeleted: false
                } as K & BaseCrudItem;
            }

            let model = new this.model(data as any);

            let doc = await model.save();

            return doc;
        } catch
            (e) {
            this.logger.error(`${this.constructor.name} failed to create`, {e, data});

            throw e;
        }

    }

    public async updateById(id: string, data: Partial<K>, options: QueryFindOneAndUpdateOptions = {}): Promise<Doc<K>> {

        try {

            if (this.model[BaseCrudSymbol]) {
                data = {updated: Date.now(), ...data} as K & BaseCrudItem;
            }

            options = {new: true, ...options};

            let doc = await this.model.findByIdAndUpdate(id, data, options)
                .exec();

            return doc;

        } catch
            (e) {

            this.logger.error(`${this.constructor.name} failed to update`, {e, data});

            throw e;
        }
    }

    public async update(query: CrudItemParams<K> | string | mongoose.Schema.Types.ObjectId, update: Partial<K>, options ?: ModelUpdateOptions): Promise<Doc<K> | void> {
        try {

            if (!_.isPlainObject(query)) {
                return this.updateById(query as string, update, options)
            }

            if (this.model[BaseCrudSymbol]) {
                update = {updated: Date.now(), ...update} as K & BaseCrudItem;
            }

            await this.model.updateMany(query, update, options).exec();

        } catch
            (e) {
            this.logger.error(`${this.constructor.name} failed to updateMulti`, {e, query});
            throw e

        }
    }

    public async deleteById(id: string, hard ?: boolean): Promise<void> {
        try {

            if (this.model[BaseCrudSymbol] && !hard) {

                await this.updateById(id, {isDeleted: true, isActive: false} as K & BaseCrudItem);

            } else {

                await this.model.findByIdAndDelete(id).exec()
            }
        } catch
            (e) {
            this.logger.error(`${this.constructor.name} failed to deleteById`, {e, id});
            throw e

        }
    }

    public async delete(query: CrudItemParams<K> | string | mongoose.Schema.Types.ObjectId, hard ?: boolean): Promise<void> {
        try {

            if (!_.isPlainObject(query)) {
                return this.deleteById(query as string, hard)
            }

            if (this.model[BaseCrudSymbol] && !hard) {
                await this.update(query, {isDeleted: true, isActive: false} as K & BaseCrudItem);
            } else {
                await this.model.deleteMany(query).exec()
            }
        } catch
            (e) {
            this.logger.error(`${this.constructor.name} failed to delete`, {e, query});
            throw e

        }

    }

    public cloneDocument(doc: Doc<K>): Doc<K> {
        let newDoc = new this.model(doc.toObject());
        return newDoc;
    }

    public cloneNewDocument(doc: Doc<K>): Doc<K> {
        let newDoc = this.cloneDocument(doc);
        newDoc._id = mongoose.Types.ObjectId();

        return doc;
    }


}
