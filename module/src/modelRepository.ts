import mongoose = require('mongoose');
import {define, inject, alias, singleton} from '@appolo/inject';
import {Model, Schema} from "../..";

@define()
@singleton()
export class ModelRepository {
    @inject() private client: mongoose.Connection;
    @alias("IModels", "modelName") private models: Model<any>[];


    public get connection(): mongoose.Connection {
        return this.client;
    }

    public getModel<T>(model: typeof Schema): Model<T> {

        let modelName = model.collectionName;

        return this.models[modelName];
    }
}
