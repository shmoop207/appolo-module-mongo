"use strict";
import Q = require('bluebird');
import {BaseCrudItem, mongoose, Schema} from "../..";
import {Doc, Model} from "appolo-mongo";
import {inject} from "@appolo/inject";
import {ILogger} from "@appolo/logger";
import {IBaseCrudItem, CrudItemParams, GetAllParams} from "./interfaces";
import {BaseCrudSymbol} from "./modelFactory";
import {ModelUpdateOptions, Query, QueryFindOneAndUpdateOptions} from "mongoose";
import {Event, IEvent} from "@appolo/events";
import {Objects} from "@appolo/utils";


export abstract class BaseCrudManager<K extends Schema> {


    @inject() protected logger: ILogger;

    protected readonly _beforeItemCreateEvent = new Event<{ data: Partial<K> }>({await: true});
    protected readonly _beforeItemUpdateEvent = new Event<{ id: string, data: Partial<K>, previous: Doc<K> }>({await: true});
    protected readonly _beforeItemCreateOrUpdateEvent = new Event<{ id?: string, data: Partial<K>, previous?: Doc<K> }>({await: true});

    protected readonly _itemCreatedEvent = new Event<{ item: Doc<K> }>({await: true});
    protected readonly _itemCreatedOrUpdatedEvent = new Event<{ item: Doc<K>, previous?: Doc<K> }>({await: true});
    protected readonly _itemUpdatedEvent = new Event<{ item: Doc<K>, previous: Doc<K> }>({await: true});


    protected abstract get model(): Model<K>

    public getById(id: string, params: Pick<GetAllParams<K>, "fields" | "populate" | "lean"> = {}): Promise<Doc<K>> {

        return this.findOne({...params, filter: {_id: id} as any});
    }

    public async findOne(params: Pick<GetAllParams<K>, "filter" | "fields" | "populate" | "lean"> = {}): Promise<Doc<K>> {

        try {

            let query = this.model
                .findOne(params.filter as object || {});

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


            let p1 = query.where(params.filter || {} as any)
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

                promises.count = query2.where(params.filter || {} as any)
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

            let query: Query<Doc<K>[], any> = this.model
                .find(options.filter as object || {})
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
                    isActive: Objects.isBoolean(isActive) ? isActive : true,
                    isDeleted: false
                } as K & BaseCrudItem;
            }

            await Promise.all([
                this._beforeItemCreateEvent.fireEvent({data}),
                this._beforeItemCreateOrUpdateEvent.fireEvent({data})
            ]);

            let model = new this.model(data as any);

            let item = await model.save();

            await Promise.all([
                this._itemCreatedEvent.fireEvent({item}),
                this._itemCreatedOrUpdatedEvent.fireEvent({item})
            ]);

            return item;
        } catch
            (e) {
            this.logger.error(`${this.constructor.name} failed to create`, {e, data});

            throw e;
        }

    }

    public async updateById(id: string, data: Partial<K>, options: QueryFindOneAndUpdateOptions = {}): Promise<Doc<K>> {

        try {

            let previous = await this.getById(id);

            if (this.model[BaseCrudSymbol]) {
                data = {...data, updated: Date.now()} as K & BaseCrudItem;
            }

            options = {new: true, ...options};

            await this.beforeUpdateById(id, data, previous);

            await Promise.all([
                this._beforeItemUpdateEvent.fireEvent({id, previous, data}),
                this._beforeItemCreateOrUpdateEvent.fireEvent({id, previous, data})
            ]);

            let item = await this.model.findByIdAndUpdate(id, data as K & BaseCrudItem, options)
                .exec();

            await Promise.all([
                this._itemUpdatedEvent.fireEvent({item, previous}),
                this._itemCreatedOrUpdatedEvent.fireEvent({item: item, previous})
            ]);

            return item;

        } catch (e) {

            this.logger.error(`${this.constructor.name} failed to update`, {e, data});

            throw e;
        }
    }

    public async updateByIdAndSave(id: string, data: Partial<K>): Promise<Doc<K>> {

        try {

            let item = await this.getById(id);

            if (!item) {
                throw new Error(`failed to find item for id ${id} ${this.constructor.name}`);
            }

            if (this.model[BaseCrudSymbol]) {
                data = {...data, updated: Date.now()} as K & BaseCrudItem;
            }

            await this.beforeUpdateById(id, data, item);

            let previous = this.cloneDocument(item);

            previous.isNew = false;

            Object.assign(item, data);

            await item.save();

            await Promise.all([
                this._itemUpdatedEvent.fireEvent({item, previous}),
                this._itemCreatedOrUpdatedEvent.fireEvent({item: item, previous})
            ]);

            return item;

        } catch (e) {

            this.logger.error(`${this.constructor.name} failed to update`, {e, data});

            throw e;
        }
    }

    protected beforeUpdateById(id: string, data: Partial<K>, previous: Doc<K>) {

    }

    public async updateAll(query: CrudItemParams<K> | string | mongoose.Schema.Types.ObjectId, update: Partial<K>, options ?: ModelUpdateOptions): Promise<Doc<K> | void> {
        try {

            if (this.model[BaseCrudSymbol]) {
                update = {updated: Date.now(), ...update} as K & BaseCrudItem;
            }

            await this.model.updateMany(query as object, update as K & BaseCrudItem, options).exec();

        } catch (e) {
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
        } catch (e) {
            this.logger.error(`${this.constructor.name} failed to deleteById`, {e, id});
            throw e

        }
    }

    public async deleteAll(query: CrudItemParams<K> | string | mongoose.Schema.Types.ObjectId, hard ?: boolean): Promise<void> {
        try {

            if (!Objects.isPlain(query)) {
                return this.deleteById(query as string, hard)
            }

            if (this.model[BaseCrudSymbol] && !hard) {
                await this.updateAll(query, {isDeleted: true, isActive: false} as K & BaseCrudItem);
            } else {
                await this.model.deleteMany(query as object).exec()
            }
        } catch (e) {
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

    public get itemCreatedEvent(): IEvent<{ item: Doc<K> }> {
        return this._itemCreatedEvent;
    }

    public get itemCreatedOrUpdatedEvent(): IEvent<{ item: Doc<K>, previous?: Doc<K> }> {
        return this._itemCreatedOrUpdatedEvent;
    }

    public get itemUpdatedEvent(): IEvent<{ item: Doc<K>, previous?: Doc<K> }> {
        return this._itemUpdatedEvent;
    }

    public get beforeItemCreatedEvent(): IEvent<{ data: Partial<K> }> {
        return this._beforeItemCreateEvent;
    }

    public get beforeItemUpdatedEvent(): IEvent<{ id: string, data: Partial<K>, previous: Doc<K> }> {
        return this._beforeItemUpdateEvent;
    }

    public get beforeItemCreatedOrUpdatedEvent(): IEvent<{ id?: string, data: Partial<K>, previous?: Doc<K> }> {
        return this._beforeItemCreateOrUpdateEvent;
    }


}
