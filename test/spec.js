"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
const logger_1 = require("@appolo/logger");
const mongoModule_1 = require("../module/mongoModule");
const modelRepository_1 = require("../module//src/modelRepository");
const someManager_1 = require("./src/someManager");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const testModel_1 = require("./src/testModel");
let should = require('chai').should();
chai.use(sinonChai);
describe("mongo module Spec", function () {
    it("should load mongo", async () => {
        let app = appolo_1.createApp({ root: __dirname, environment: "production", port: 8181 });
        await app.module(logger_1.LoggerModule);
        await app.module(new mongoModule_1.MongoModule({ connection: process.env.MONGO }));
        await app.launch();
        let modelRepository = app.injector.get(modelRepository_1.ModelRepository);
        modelRepository.connection.readyState.should.be.eq(1);
        let manager = app.injector.get(someManager_1.SomeManager);
        manager.testModel.should.be.ok;
        manager.testModel.modelName.should.be.eq("Test");
        manager.testModel.setName3.should.be.ok;
        let doc = new manager.testModel();
        doc.setName2.should.be.ok;
        doc.name = "aa";
        doc.setName = "aa";
        doc.name.should.be.eq("aaaa");
        let model = modelRepository.getModel(testModel_1.Test);
        model.modelName.should.be.eq("Test");
        await app.reset();
    });
});
//# sourceMappingURL=spec.js.map