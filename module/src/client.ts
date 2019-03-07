"use strict";
import {define, factory, IEnv, IFactory, inject, singleton} from 'appolo';
import {ILogger} from "@appolo/logger";
import {IOptions} from "./interfaces";
import mongoose = require('mongoose');
import _ = require("lodash");
import Q = require('bluebird');


@define()
@singleton()
@factory()
export class Client implements IFactory<mongoose.Connection> {

    @inject() logger: ILogger;
    @inject() moduleOptions: IOptions;
    @inject() env: IEnv;

    public async get(): Promise<mongoose.Connection> {

        try {
            mongoose.Promise = Q;

            let connectionString = this.moduleOptions.connection;

            let mongoOptions: mongoose.ConnectionOptions = {
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

                this.logger.error('disconnected from mongodb', {url: connectionString});

                if (this.moduleOptions.exitOnDisconnect && this.env.type != "testing") {
                    process.exit(1);
                }
            });

            mongoose.connection.on('reconnected', () => {

                this.logger.info('reconnected to mongodb', {url: connectionString});
            });

            const connection = await mongoose.createConnection(connectionString, mongoOptions);

            this.logger.info(`mongodb connection ${this.moduleOptions.id} open`);

            return connection

        } catch (e) {

            this.logger.info('mongodb failed to open connection', {e: e.toString()});

            throw e;
        }

    }
}
