import {IBaseCrudItem} from "./interfaces";
import {prop, Schema} from "../../index";

export class BaseCrudItem extends Schema implements IBaseCrudItem {
    _id: any;

    @prop({type: Boolean, default: false})
    isActive: boolean;

    @prop({type: Boolean, default: false})
    isDeleted: boolean;

    @prop({type: Number})
    created: number;

    @prop({type: Number})
    updated: number;
}
