"use strict";
import {define, factory, IFactory, inject, singleton} from '@appolo/inject';
import {IEnv,App} from '@appolo/core';
import {ILogger} from "@appolo/logger";
import {IOptions} from "./interfaces";
import mongoose = require('mongoose');
import _ = require("lodash");
import Q = require('bluebird');

const ConnectionIdSymbol = Symbol("connectionId");

@define()
@singleton()
@factory()
export class Client implements IFactory<mongoose.Connection> {

    @inject() logger: ILogger;
    @inject() moduleOptions: IOptions;
    @inject() env: IEnv;
    @inject() app: App;

    public async get(): Promise<mongoose.Connection> {

        try {

            if (this.moduleOptions.useConnectionId) {
                let conn = _.find(mongoose.connections, conn => conn[ConnectionIdSymbol] == this.moduleOptions.useConnectionId);

                if(conn){
                    return conn
                }
            }

            mongoose.Promise = Q;

            let connectionString = this.moduleOptions.connection;

            let mongoOptions: mongoose.ConnectionOptions = {
                keepAlive: true,
                useFindAndModify: false,
                useNewUrlParser: true,
                useCreateIndex: true,
                //autoReconnect: true,
               // reconnectTries: Number.MAX_VALUE,
               // reconnectInterval: 500,
                useUnifiedTopology:true
            };

            if (this.moduleOptions.config) {
                _.merge(mongoOptions, this.moduleOptions.config);
            }

            mongoose.connection.on('disconnected', () => {

                this.logger.error('disconnected from mongodb', {url: connectionString});

                if (this.moduleOptions.exitOnDisconnect && this.env.type != "testing") {
                    process.exit(1);
                }
            });

            mongoose.connection.on('reconnected', () => {

                this.logger.info('reconnected to mongodb', {url: connectionString});
            });


            const connection = await mongoose.createConnection(connectionString, mongoOptions);

            if (this.moduleOptions.connectionId) {
                connection[ConnectionIdSymbol] = this.moduleOptions.connectionId;
            }

            this.logger.info(`mongodb connection open`);

            return connection

        } catch (e) {

            this.logger.info('mongodb failed to open connection', {e: e.toString()});

            throw e;
        }

    }
}
