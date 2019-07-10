import {TestNested} from "./testNested";
import {TesRef} from "./tesRef";
import {
    BaseCrudItem,
    Doc,
    method,
    model,
    Model,
    pre,
    prop,
    Ref,
    schema,
    Schema,
    staticMethod,
    virtual
} from "../../index";

@model()
@schema("Test", {strict: true})
export class Test extends BaseCrudItem {


    _id: string;

    @prop({type: String})
    name: string;

    @prop(TestNested)
    nested: TestNested;

    @prop(TestNested)
    nestedArr: TestNested[];

    @prop({ref: TesRef})
    testRef: Ref<TesRef>;

    @prop([{ref: TesRef}])
    testRefArr: Ref<TesRef>;

    @virtual()
    set setName(name) {
        this.name += name;
    }

    @method()
    setName2(this: Doc<Test>, name) {
        this.save += name;
    }

    @staticMethod()
    static setName3(this: Model<Test>, name) {
        return this.findById(name);
    }

    @pre("save")
    private preSave() {

    }

}
