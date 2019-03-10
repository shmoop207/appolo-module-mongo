import {define,singleton,inject} from 'appolo'
import {Test} from "./testModel";
import {Model,injectModel} from "../../index";

@define()
@singleton()
export class SomeManager  {
    @injectModel(Test) testModel: Model<Test> & typeof Test

    test(){

    }

}