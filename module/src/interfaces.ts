import {ConnectionOptions, Schema, SchemaOptions, SchemaTypeOpts,PopulateOptions} from "mongoose";

export interface IBaseCrudItem {
    _id?: string,
    isDeleted?: boolean,
    isActive?: boolean,
    updated?: number,
    created?: number
}

export type CrudItemParams<T> = { [J in keyof Partial<T> | string]: any };

export interface GetAllParams<T> {
    page?: number,
    pageSize?: number,
    sort?: string | string | CrudItemParams<T>,
    filter?: string | CrudItemParams<T>,
    fields?: string | CrudItemParams<T>,
    lean?: boolean
    populate?: string | PopulateOptions | PopulateOptions[];
}


export interface IOptions {
    connection: string,
    connectionId?: string
    useConnectionId?: string
    id?: string,
    exitOnDisconnect?: boolean
    config?: ConnectionOptions
}
