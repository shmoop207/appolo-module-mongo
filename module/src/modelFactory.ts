import {IFactory} from 'appolo';
import mongoose = require('mongoose');
import {BaseCrudItem, Schema} from "../..";

export const BaseCrudSymbol = Symbol("baseCrudSymbol");


export class ModelFactory implements IFactory<mongoose.Model<any>> {

    private schema: typeof Schema;
    private connection: mongoose.Connection;


    public get() {

        let model = this.schema.getModel(this.connection);

        if (BaseCrudItem.prototype.isPrototypeOf(this.schema.prototype)) {
            Reflect.defineMetadata(BaseCrudSymbol, model, model);
            model[BaseCrudSymbol] = true;
        }

        return model;
    }
}
