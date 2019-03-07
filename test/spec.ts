import {createApp} from 'appolo'
import {LoggerModule} from '@appolo/logger';
import {MongoModule} from "../module/mongoModule";
import {ModelRepository} from "../module//src/modelRepository";
import {mongoose} from "../index";
import {SomeManager} from "./src/someManager";
import chai = require('chai');
import sinonChai = require("sinon-chai");
import {Test} from "./src/testModel";

let should = require('chai').should();
chai.use(sinonChai);

describe("mongo module Spec", function () {
    it("should load mongo", async () => {

        let app = createApp({root: __dirname, environment: "production", port: 8181});

        await app.module(LoggerModule);

        await app.module(new MongoModule({connection: process.env.MONGO}));

        await app.launch();

        let modelRepository = app.injector.get<ModelRepository>(ModelRepository);

        modelRepository.connection.readyState.should.be.eq(1);

        let manager = app.injector.get<SomeManager>(SomeManager);

        manager.testModel.should.be.ok;
        manager.testModel.modelName.should.be.eq("Test");
        manager.testModel.setName3.should.be.ok;

        let doc = new manager.testModel();
        doc.setName2.should.be.ok;
        doc.name = "aa";
        doc.setName = "aa";

        doc.name.should.be.eq("aaaa");

        let model = modelRepository.getModel<Test>(Test);

        model.modelName.should.be.eq("Test");

        await app.reset();
    })
});