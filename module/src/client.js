"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const engine_1 = require("@appolo/engine");
const mongoose = require("mongoose");
const ConnectionIdSymbol = Symbol("connectionId");
let Client = class Client {
    async get() {
        try {
            if (this.moduleOptions.useConnectionId) {
                let conn = (mongoose.connections || []).find(conn => conn[ConnectionIdSymbol] == this.moduleOptions.useConnectionId);
                if (conn) {
                    return conn;
                }
            }
            //mongoose.Promise = Q;
            let connectionString = this.moduleOptions.connection;
            let mongoOptions = {
                keepAlive: true,
                //useFindAndModify: false,
                //useNewUrlParser: true,
                //useCreateIndex: true,
                //autoReconnect: true,
                // reconnectTries: Number.MAX_VALUE,
                // reconnectInterval: 500,
                //useUnifiedTopology: true
            };
            if (this.moduleOptions.config) {
                Object.assign(mongoOptions, this.moduleOptions.config);
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
            if (this.moduleOptions.connectionId) {
                connection[ConnectionIdSymbol] = this.moduleOptions.connectionId;
            }
            this.logger.info(`mongodb connection open`);
            return connection;
        }
        catch (e) {
            this.logger.info('mongodb failed to open connection', { e: e.toString() });
            throw e;
        }
    }
};
(0, tslib_1.__decorate)([
    (0, inject_1.inject)(),
    (0, tslib_1.__metadata)("design:type", Object)
], Client.prototype, "logger", void 0);
(0, tslib_1.__decorate)([
    (0, inject_1.inject)(),
    (0, tslib_1.__metadata)("design:type", Object)
], Client.prototype, "moduleOptions", void 0);
(0, tslib_1.__decorate)([
    (0, inject_1.inject)(),
    (0, tslib_1.__metadata)("design:type", Object)
], Client.prototype, "env", void 0);
(0, tslib_1.__decorate)([
    (0, inject_1.inject)(),
    (0, tslib_1.__metadata)("design:type", engine_1.App)
], Client.prototype, "app", void 0);
Client = (0, tslib_1.__decorate)([
    (0, inject_1.define)(),
    (0, inject_1.singleton)(),
    (0, inject_1.factory)()
], Client);
exports.Client = Client;
//# sourceMappingURL=client.js.map