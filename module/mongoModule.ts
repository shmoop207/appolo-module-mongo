import {module, Module, Util} from 'appolo';
import {ModelRepository} from "./src/modelRepository";
import {InjectModelKey, ModelKey} from "./src/decorator";
import {ModelFactory} from "./src/modelFactory";
import {IOptions} from "./src/interfaces";
import {Schema} from "../index";
import _ = require('lodash');

@module()
export class MongoModule extends Module<IOptions> {

    constructor(options: IOptions) {
        super(options);
    }

    protected readonly Defaults: Partial<IOptions> = {
        id: "modelRepository",
    };

    public afterInitialize() {


        let modules = Util.findAllReflectData<string>(ModelKey, this.parent.exported);
        _.forEach(modules, item => {

            this.app.injector.register(item.metaData, ModelFactory)
                .inject("connection", "client")
                .singleton()
                .alias("IModels")
                .injectValue("schema", item.fn)
                .factory()
        });

        let injectModules = Util.findAllReflectData<{ propertyKey: string, model: Schema }[]>(InjectModelKey, this.parent.exported);

        _.forEach(injectModules, item => {
            let define = Util.getClassDefinition(item.fn);

            _.forEach(item.metaData, metaData => {
                let modelName = Util.getReflectData<string>(ModelKey, metaData.model);
                define.inject({name: metaData.propertyKey, ref: modelName, injector: this.app.injector})
            })
        });
    }


    public get exports() {
        return [{id: this.moduleOptions.id, type: ModelRepository}];
    }
}
