import {define,singleton,inject} from '@appolo/inject'
import {Test} from "./testModel";
import {Model, model, BaseCrudManager} from "../../index";

@define()
@singleton()
export class SomeManager  extends BaseCrudManager<Test>{
    @model(Test) model: Model<Test> & typeof Test

    test(){

    }

}
