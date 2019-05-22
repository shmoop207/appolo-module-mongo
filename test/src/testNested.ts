import {define} from 'appolo'
import {TestNestedDeep} from "./testNestedDeep";
import {prop, schema} from "../../index";


@schema("TestNested", {strict: true})
export class TestNested extends TestNestedDeep {


    @prop({type: String})
    name?: string;

}
