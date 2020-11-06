import {prop, Schema, schema} from "../../index";


export class TestNestedDeep extends Schema {

    _id?: string;

    @prop({type: String})
    deep: string;

}
