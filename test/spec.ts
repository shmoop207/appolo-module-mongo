import {createApp} from '@appolo/engine'
import {LoggerModule} from '@appolo/logger';
import {MongoModule} from "../module/mongoModule";
import {ModelRepository} from "../module/src/modelRepository";
import {SomeManager} from "./src/someManager";
import chai = require('chai');
import sinonChai = require("sinon-chai");
import {Test} from "./src/testModel";

let should = require('chai').should();
chai.use(sinonChai);

describe("mongo module Spec", function () {
    it("should load mongo", async () => {

        let app = createApp({root: __dirname, environment: "production"});

        await app.module.load(LoggerModule);

        await app.module.use(MongoModule.for({connection: process.env.MONGO}));

        await app.launch();

        let modelRepository = app.injector.get<ModelRepository>(ModelRepository);

        modelRepository.connection.readyState.should.be.eq(1);

        let manager: SomeManager = app.injector.get<SomeManager>(SomeManager);

        manager.model.should.be.ok;
        manager.model.modelName.should.be.eq("Test");
        manager.model.setName3.should.be.ok;

        await manager.create({});

        let doc = new manager.model();
        doc.setName2.should.be.ok;
        doc.name = "aa";
        doc.setName = "aa";
        doc.nested = {deep: "ccccc", name: "11", name2: ""};

        doc.name.should.be.eq("aaaa");
        doc.nested.deep.should.be.eq("ccccc");

        this

        let model = modelRepository.getModel<Test>(Test);

        model.modelName.should.be.eq("Test");

        await app.reset();
    })
});
