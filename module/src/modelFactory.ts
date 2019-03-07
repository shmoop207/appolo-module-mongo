import {IFactory} from 'appolo';
import mongoose = require('mongoose');
import {Schema} from "../..";

export class ModelFactory implements IFactory<mongoose.Model<any>> {

    private schema: typeof Schema;
    private connection: mongoose.Connection;

    public get() {
        return this.schema.getModel(this.connection);
    }
}