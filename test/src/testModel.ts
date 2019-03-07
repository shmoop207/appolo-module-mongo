import {TestNested} from "./testNested";
import {TesRef} from "./tesRef";
import {DocType, method, model, ModelType, pre, prop, Ref, schema, Schema, staticMethod, virtual} from "../../index";

@model()
@schema("Test", {strict: true})
export class Test extends Schema {


    _id: string;

    @prop({type: String})
    name: string;

    @prop(TestNested)
    nested: TestNested;

    @prop({ref: TesRef})
    testRef: Ref<TesRef>;

    @prop([{ref: TesRef}])
    testRefArr: Ref<TesRef>;

    @virtual()
    set setName(name) {
        this.name += name;
    }

    @method()
    setName2(this: DocType<Test>, name) {
        this.save += name;
    }

    @staticMethod()
    static setName3(this: ModelType<Test>, name) {
        return this.findById(name);
    }

    @pre("save")
    private preSave() {

    }

}