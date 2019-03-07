import "reflect-metadata";
import {Util} from 'appolo';
import {Schema} from 'appolo-mongo';


export const ModelKey = Symbol("model");
export const InjectModelKey = Symbol("injectModel");


export function model(name?: string) {

    return function (fn: typeof Schema) {

        name = name || Util.getClassName(fn) + "Model";
        Reflect.defineMetadata(ModelKey, name, fn);
    }
}

export function injectModel(model: string | typeof Schema) {

    return function (fn: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let models = Util.getReflectData(InjectModelKey, fn.constructor, []);

        models.push({fn, propertyKey,model})

    }
}