import "reflect-metadata";
import {Schema} from 'appolo-mongo';
import {Classes, Reflector} from '@appolo/utils';


export const ModelKey = Symbol("model");
export const InjectModelKey = Symbol("injectModel");


export function model(name?: string| typeof Schema) {

    return function (fn: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        if (propertyKey) {
            return injectModel(name)(fn, propertyKey, descriptor)
        }

        name = name || Classes.className(fn) + "Model";
        Reflect.defineMetadata(ModelKey, name, fn);
    }
}

function injectModel(model: string | typeof Schema) {

    return function (fn: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let models = Reflector.getFnMetadata(InjectModelKey, fn.constructor, []);

        models.push({fn, propertyKey, model})

    }
}
