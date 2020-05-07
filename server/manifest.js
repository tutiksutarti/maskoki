'use strict';

const Dotenv = require('dotenv');
const Confidence = require('confidence');
const Toys = require('toys');
const Schwifty = require('schwifty');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: 'localhost',
        port: {
            $env: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: { $env: 'NODE_ENV' },
            $default: {
                log: ['error'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                routes: {
                    prefix: '/api'
                },
                options: {
                    jwtKey: {
                        $filter: { $env: 'NODE_ENV' },
                        $default: {
                            $env: 'APP_SECRET',
                            $default: 'app-secret'
                        },
                        production: {
                            $env: 'APP_SECRET'
                        }
                    }
                }
            },
            {
                plugin: './plugins/swagger'
            },
            {
                plugin: 'schwifty',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        migrateOnStart: true,
                        knex: {
                            client: 'mysql',
                            connection: {
                                host: { $env: 'DB_HOST' },
                                port: {
                                    $env: 'DB_PORT',
                                    $coerce: 'number',
                                    $default: 3306
                                },
                                database: { $env: 'DB_DATABASE' },
                                user: { $env: 'DB_USERNAME' },
                                password: { $env: 'DB_PASSWORD' }
                            },
                            migrations: {
                                stub: Schwifty.migrationsStubPath
                            }
                        }
                    },
                    production: {
                        migrateOnStart: false
                    }
                }
            },
            {
                plugin: {
                    $filter: { $env: 'NODE_ENV' },
                    $default: 'hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});
