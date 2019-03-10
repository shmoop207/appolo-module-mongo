import {ConnectionOptions} from "mongoose";
import {Doc, Model, Schema, schema, prop,staticMethod,virtual,method,Ref,pre,post,index} from "appolo-mongo";
import {model,injectModel} from "./module/src/decorator";
import {MongoModule} from "./module/mongoModule";
import {ModelRepository} from "./module/src/modelRepository";
import {BaseCrudManager} from "./module/src/baseCrudManager";
import {BaseCrudItem, CrudItemParams, GetAllParams} from "./module/src/interfaces";



export import mongoose = require('mongoose');

export {ConnectionOptions,ModelRepository,
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
    BaseCrudItem,
    BaseCrudManager,
    CrudItemParams,
    GetAllParams,
    model,
    pre,
    post,
    index
}