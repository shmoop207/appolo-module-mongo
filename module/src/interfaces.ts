import {mongoose} from "../..";
import {ConnectionOptions, Schema, SchemaOptions, SchemaTypeOpts} from "mongoose";
import {IModuleOptions} from "appolo";
import {IndexOptions} from "mongodb";

export interface IBaseCrudItem {
    _id?: string,
    isDeleted?: boolean,
    isActive?: boolean,
    updated?: number,
    created?: number
}

export type CrudItemParams<T> = { [J in keyof Partial<T>]: any };

export interface GetAllParams<T> {
    page?: number,
    pageSize?: number,
    sort?: string | string | CrudItemParams<T>,
    filter?: string | CrudItemParams<T>,
    fields?: string | CrudItemParams<T>,
    lean?: boolean
    populate?: string | mongoose.ModelPopulateOptions | mongoose.ModelPopulateOptions[];
}


export interface IOptions extends IModuleOptions {
    connection: string,
    id?: string,
    exitOnDisconnect?: boolean
    config?: ConnectionOptions
}
