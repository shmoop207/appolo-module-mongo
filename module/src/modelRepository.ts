import mongoose = require('mongoose');
import {define, inject, injectAlias, singleton} from 'appolo';
import {ModelType, Schema} from "../..";

@define()
@singleton()
export class ModelRepository {
    @inject() private client: mongoose.Connection;
    @injectAlias("IModels", "modelName") private models: ModelType<any>[];


    public get connection(): mongoose.Connection {
        return this.client;
    }

    public getModel<T>(model: typeof Schema): ModelType<T> {

        let modelName = model.collectionName;

        return this.models[modelName];
    }
}