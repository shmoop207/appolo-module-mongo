import {define} from 'appolo'
import {prop, Schema, schema} from "../../index";


@schema("TestNestedDeep", {strict: true})
export class TestNestedDeep extends Schema {

    _id: string;

    @prop({type: String})
    deep: string;

}