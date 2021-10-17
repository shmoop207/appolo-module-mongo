"use strict";
var MongoModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoModule = void 0;
const tslib_1 = require("tslib");
const engine_1 = require("@appolo/engine");
const modelRepository_1 = require("./src/modelRepository");
const decorator_1 = require("./src/decorator");
const modelFactory_1 = require("./src/modelFactory");
const utils_1 = require("@appolo/utils");
let MongoModule = MongoModule_1 = class MongoModule extends engine_1.Module {
    constructor() {
        super(...arguments);
        this.Defaults = {
            id: "modelRepository",
        };
    }
    static for(options) {
        return { type: MongoModule_1, options };
    }
    beforeModuleLaunch() {
        let modules = this.parent.discovery.findAllReflectData(decorator_1.ModelKey);
        (modules || []).forEach(item => {
            this.app.injector.register(item.metaData, modelFactory_1.ModelFactory)
                .inject("connection", "client")
                .singleton()
                .alias("IModels")
                .injectValue("schema", item.fn)
                .factory();
        });
        let injectModules = this.parent.discovery.findAllReflectData(decorator_1.InjectModelKey);
        utils_1.Arrays.forEach(injectModules, item => {
            let define = this.parent.injector.getDefinition(item.fn);
            utils_1.Arrays.forEach(item.metaData, metaData => {
                let modelName = this.parent.discovery.getReflectMetadata(decorator_1.ModelKey, metaData.model);
                define.inject.push({ name: metaData.propertyKey, ref: modelName, injector: this.app.injector });
            });
        });
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: modelRepository_1.ModelRepository }];
    }
};
MongoModule = MongoModule_1 = (0, tslib_1.__decorate)([
    (0, engine_1.module)()
], MongoModule);
exports.MongoModule = MongoModule;
//# sourceMappingURL=mongoModule.js.map