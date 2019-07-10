import {ConnectionOptions} from "mongoose";
import {
    Doc,
    Model,
    Schema,
    schema,
    prop,
    staticMethod,
    virtual,
    method,
    Ref,
    pre,
    post,
    index,
    propArray,
    propRef,
    propRefArray, ObjectId
} from "appolo-mongo";
import {model, injectModel} from "./module/src/decorator";
import {MongoModule} from "./module/mongoModule";
import {ModelRepository} from "./module/src/modelRepository";
import {BaseCrudManager} from "./module/src/baseCrudManager";
import {IBaseCrudItem, CrudItemParams, GetAllParams} from "./module/src/interfaces";
import {BaseCrudItem} from "./module/src/baseCrudItem";


export import mongoose = require('mongoose');

export {
    ConnectionOptions, ModelRepository,
    injectModel,
    Ref,
    staticMethod,
    virtual,
    method,
    MongoModule,
    Schema,
    schema,
    prop,
    Doc,
    Model,
    IBaseCrudItem,
    BaseCrudItem,
    BaseCrudManager,
    CrudItemParams,
    GetAllParams,
    model,
    pre,
    post, propArray, index, propRef, propRefArray, ObjectId
}
