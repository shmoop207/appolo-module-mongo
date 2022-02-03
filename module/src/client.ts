"use strict";
import {define, factory, IFactory, inject, singleton} from '@appolo/inject';
import {IEnv, App} from '@appolo/engine';
import {ILogger} from "@appolo/logger";
import {IOptions} from "./interfaces";
import {Arrays} from "@appolo/utils";
import mongoose = require('mongoose');

const ConnectionIdSymbol = Symbol("connectionId");

mongoose.set('strictQuery', false);
mongoose.set('strictPopulate' as any, false);

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
                let conn = (mongoose.connections || []).find(conn => conn[ConnectionIdSymbol] == this.moduleOptions.useConnectionId);

                if (conn) {
                    return conn
                }
            }

            //mongoose.Promise = Q;

            let connectionString = this.moduleOptions.connection;

            let mongoOptions: mongoose.ConnectOptions = {
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
