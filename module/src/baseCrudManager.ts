"use strict";
import Q = require('bluebird');
import _ = require('lodash');
import {BaseCrudItem, mongoose, Schema} from "../..";
import {Doc, Model} from "appolo-mongo";
import {inject} from "appolo";
import {ILogger} from "@appolo/logger";
import {IBaseCrudItem, CrudItemParams, GetAllParams} from "./interfaces";
import {BaseCrudSymbol} from "./modelFactory";
import {QueryFindOneAndUpdateOptions} from "mongoose";


export abstract class BaseCrudManager<K extends Schema> {

    @inject() logger: ILogger;

    protected abstract get model(): Model<K>


    public async getOne(id: string, fields?: string | CrudItemParams<K>, populate?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<Doc<K>> {
        try {

            let query = this.model.findById(id)
                .select(fields || {});

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                query.where('isDeleted', false)
            }

            let item = await query.populate(populate || []).exec();

            return item;

        } catch (e) {

            this.logger.error(`failed to get ${this.constructor.name} ${id}`, {e});

            throw e;
        }
    }

    public async findOne(filter: string | Object, fields?: string | CrudItemParams<K>, populate?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<Doc<K>> {

        try {

            let query = this.model.findOne(filter)
                .select(fields || {});

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                query.where('isDeleted', false)
            }

            let item = await query.where('isDeleted', false)
                .populate(populate || [])
                .exec();

            return item;

        } catch (e) {
            this.logger.error(`failed to findOne ${filter} ${this.constructor.name}`, {e});

            throw e;
        }
    }

    public async getAll(options: GetAllParams<Partial<K>> = {}): Promise<{ results: Doc<K>[], count: number }> {

        try {
            let query = this.model.find({})
                .select(options.fields || {});

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                query.where('isDeleted', false)
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

            let {results, count} = await Q.props(promises);

            return {results: results as Doc<K>[], count: count || (results as Doc<K>[]).length};
        } catch (e) {
            this.logger.error(`failed to getAll ${this.constructor.name} ${JSON.stringify(options)}`, {e});

            throw e;
        }
    }

    public async findAll(filter: string | CrudItemParams<K>, populate?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<Doc<K>[]> {

        try {

            let query = this.model
                .find(filter);

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                query.where('isDeleted', false)
            }

            let items = await query.where('isDeleted', false)
                .populate(populate || [])
                .exec();

            return items;

        } catch (e) {
            this.logger.error(`failed to findAll ${this.constructor.name}`, {e});

            throw e;
        }
    }

    public async create(data: Partial<K>): Promise<Doc<K>> {

        try {

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                let crud = data as K & BaseCrudItem;
                crud.created = Date.now();
                crud.updated = Date.now();
                crud.isActive = _.isBoolean(crud.isActive) ? crud.isActive : true;
                crud.isDeleted = false;
            }

            let model = new this.model(data);

            let doc = await model.save();

            return doc;
        } catch (e) {
            this.logger.error(`failed to create ${this.constructor.name} ${JSON.stringify(data)}`, {e});

            throw e;
        }

    }

    public async updateById(id: string, data: Partial<K>, options?: QueryFindOneAndUpdateOptions): Promise<Doc<K>> {

        try {

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                (data as K & BaseCrudItem).updated = Date.now();
            }

            let doc = await this.model.findByIdAndUpdate(id, data, {new: true})
                .exec();

            return doc;

        } catch (e) {

            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, {e});

            throw e;
        }
    }

    public async update(query: CrudItemParams<K>, update: Partial<K>): Promise<void> {
        try {

            if (Reflect.hasMetadata(BaseCrudSymbol, this.model)) {
                (update as K & BaseCrudItem).updated = Date.now();
            }

            await this.model.updateMany(query, update).exec();

        } catch (e) {
            this.logger.error(`failed to updateMulti ${this.constructor.name}`, {e});

        }
    }

    public async deleteById(id: string, hard?: boolean): Promise<Doc<K>> {
        if (Reflect.hasMetadata(BaseCrudSymbol, this.model) && !hard) {
            return this.updateById(id, {isDeleted: true, isActive: false} as K & BaseCrudItem);
        } else {
            return this.model.findByIdAndDelete(id).exec()
        }
    }

    public async delete(query: CrudItemParams<K>, hard?: boolean): Promise<void> {
        if (Reflect.hasMetadata(BaseCrudSymbol, this.model) && !hard) {
            await this.update(query, {isDeleted: true, isActive: false} as K & BaseCrudItem);
        } else {
            await this.model.deleteMany(query).exec()
        }
    }


}
