"use strict";
import Q = require('bluebird');
import _ = require('lodash');
import {mongoose} from "../..";
import {Doc, Model} from "appolo-mongo";
import {inject} from "appolo";
import {ILogger} from "@appolo/logger";
import {BaseCrudItem, CrudItemParams, GetAllParams} from "./interfaces";



export abstract class BaseCrudManager<K extends BaseCrudItem> {

    @inject() logger: ILogger;

    protected abstract get model(): Model<K>


    public async getOne(id: string, fields?: string | CrudItemParams<K>, populate?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<Doc<K>> {
        try {

            let item = await this.model.findById(id)
                .select(fields || {})
                .where('isDeleted', false)
                .populate(populate || [])
                .exec();

            return item;

        } catch (e) {

            this.logger.error(`failed to get ${this.constructor.name} ${id}`, {e});

            throw e;
        }
    }

    public async findOne(filter: string | Object, fields?: string | CrudItemParams<K>, populate?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<Doc<K>> {

        try {

            let item = await this.model.findOne(filter)
                .select(fields || {})
                .where('isDeleted', false)
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

            let {results, count} = await Q.props(promises);

            return {results: results as Doc<K>[], count: count || (results as Doc<K>[]).length};
        } catch (e) {
            this.logger.error(`failed to getAll ${this.constructor.name} ${JSON.stringify(options)}`, {e});

            throw e;
        }
    }

    public async findAll(filter: string | CrudItemParams<K>, populate?: mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[]): Promise<Doc<K>[]> {

        try {

            let items = await this.model
                .find(filter)
                .where('isDeleted', false)
                .populate(populate || []).exec();
            return items;

        } catch (e) {
            this.logger.error(`failed to findAll ${this.constructor.name}`, {e});

            throw e;
        }
    }

    public async create(data: Partial<K>, ...args: any[]): Promise<Doc<K>> {

        try {
            data.created = Date.now();
            data.updated = Date.now();
            data.isActive = _.isBoolean(data.isActive) ? data.isActive : true;
            data.isDeleted = false;

            let model = new this.model(data);

            let doc = await model.save();

            return doc;
        } catch (e) {
            this.logger.error(`failed to create ${this.constructor.name} ${JSON.stringify(data)}`, {e});

            throw e;
        }

    }

    public async updateByModel(id: string, data: Partial<K>, ...args: any[]): Promise<Doc<K>> {

        try {

            data.updated = Date.now();

            let updateData = _.has(data, '$set') ? data : {$set: data};

            let doc = await this.model.findByIdAndUpdate(id, updateData, {new: true})
                .exec();

            return doc;

        } catch (e) {

            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, {e});

            throw e;
        }
    }

    public async update(id: string, data: Partial<K>, ...args: any[]): Promise<Doc<K>> {

        try {

            let item = await this.getOne(id);

            if (!item) {
                throw new Error(`failed to find item for id ${id} ${this.constructor.name}`);
            }

            item.updated = Date.now();

            _.extend(item, data);

            await item.save();

            return item;

        } catch (e) {

            this.logger.error(`failed to update ${this.constructor.name} ${JSON.stringify(data)}`, {e});

            throw e;
        }

    }

    public async delete(id: string, ...args: any[]): Promise<Doc<K>> {

        return this.update(id, {isDeleted: true, isActive: false} as K, args);
    }

    public async updateMulti(query: string | CrudItemParams<K>, update: Partial<K>, ...args: any[]): Promise<any> {
        try {
            const items = await this.findAll(query);

            await Q.map(items, item => this.update(item._id, update, ...args), {concurrency: 20});
        } catch (e) {
            this.logger.error(`failed to updateMulti ${this.constructor.name}`, {e});

        }
    }
}