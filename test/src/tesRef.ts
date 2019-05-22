import {model, prop, Schema, schema} from "../../index";


enum Test {
    A ="aaa",
    B = 1,
    F = 2,
    C = "11",
    D= "111"

}
@model()
@schema("TesRef", {strict: true})
export class TesRef extends Schema {

    _id: string;

    @prop({type: String,enum:Test})
    bla: string;
}
