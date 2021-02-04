import {module, Module, IModuleParams} from '@appolo/engine';
import {ModelRepository} from "./src/modelRepository";
import {InjectModelKey, ModelKey} from "./src/decorator";
import {ModelFactory} from "./src/modelFactory";
import {IOptions} from "./src/interfaces";
import {Schema} from "../index";
import {Reflector,Arrays} from "@appolo/utils";

@module()
export class MongoModule extends Module<IOptions> {


    public static for(options: IOptions): IModuleParams {
        return {type: MongoModule, options}
    }

    protected readonly Defaults: Partial<IOptions> = {
        id: "modelRepository",
    };

    public beforeModuleLaunch() {


        let modules = this.parent.discovery.findAllReflectData<string>(ModelKey);
        (modules||[]).forEach( item => {

            this.app.injector.register(item.metaData, ModelFactory)
                .inject("connection", "client")
                .singleton()
                .alias("IModels")
                .injectValue("schema", item.fn)
                .factory()
        });

        let injectModules = this.parent.discovery.findAllReflectData<{ propertyKey: string, model: Schema }[]>(InjectModelKey);

        Arrays.forEach(injectModules, item => {
            let define =  this.parent.injector.getDefinition(item.fn);

            Arrays.forEach(item.metaData, metaData => {
                let modelName = this.parent.discovery.getReflectMetadata<string>(ModelKey, metaData.model);


                define.inject.push({name: metaData.propertyKey, ref: modelName, injector: this.app.injector})
            })
        });
    }


    public get exports() {
        return [{id: this.moduleOptions.id, type: ModelRepository}];
    }
}
