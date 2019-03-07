"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const mongoose = require("mongoose");
const _ = require("lodash");
const Q = require("bluebird");
let Client = class Client {
    async get() {
        try {
            mongoose.Promise = Q;
            let connectionString = this.moduleOptions.connection;
            let mongoOptions = {
                keepAlive: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                autoReconnect: true,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 500
            };
            if (this.moduleOptions.config) {
                _.merge(mongoOptions, this.moduleOptions.config);
            }
            mongoose.connection.on('disconnected', () => {
                this.logger.error('disconnected from mongodb', { url: connectionString });
                if (this.moduleOptions.exitOnDisconnect && this.env.type != "testing") {
                    process.exit(1);
                }
            });
            mongoose.connection.on('reconnected', () => {
                this.logger.info('reconnected to mongodb', { url: connectionString });
            });
            const connection = await mongoose.createConnection(connectionString, mongoOptions);
            this.logger.info(`mongodb connection ${this.moduleOptions.id} open`);
            return connection;
        }
        catch (e) {
            this.logger.info('mongodb failed to open connection', { e: e.toString() });
            throw e;
        }
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "logger", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "env", void 0);
Client = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton(),
    appolo_1.factory()
], Client);
exports.Client = Client;
//# sourceMappingURL=client.js.map