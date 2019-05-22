import {define,singleton,inject} from 'appolo'
import {Test} from "./testModel";
import {Model, injectModel, BaseCrudManager} from "../../index";

@define()
@singleton()
export class SomeManager  extends BaseCrudManager<Test>{
    @injectModel(Test) model: Model<Test> & typeof Test

    test(){

    }

}
