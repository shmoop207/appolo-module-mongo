import {define,singleton,inject} from 'appolo'
import {Test} from "./testModel";
import {ModelType,injectModel} from "../../index";

@define()
@singleton()
export class SomeManager  {
    @injectModel(Test) testModel: ModelType<Test> & typeof Test

    test(){

    }

}