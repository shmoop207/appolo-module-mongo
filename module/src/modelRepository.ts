import mongoose = require('mongoose');
import {define, inject, injectAlias, singleton} from 'appolo';
import {Model, Schema} from "../..";

@define()
@singleton()
export class ModelRepository {
    @inject() private client: mongoose.Connection;
    @injectAlias("IModels", "modelName") private models: Model<any>[];


    public get connection(): mongoose.Connection {
        return this.client;
    }

    public getModel<T>(model: typeof Schema): Model<T> {

        let modelName = model.collectionName;

        return this.models[modelName];
    }
}