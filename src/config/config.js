// config/config.js (ES Module)

import {
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT,
} from "./server-config.js";

const config = {
  development: {
    username: DB_USERNAME || "root",
    password: DB_PASSWORD || null,
    database: DB_NAME || "mydb",
    host: DB_HOST || "127.0.0.1",
    dialect: DB_DIALECT || "mysql",
  },
  test: {
    username: DB_USERNAME || "root",
    password: DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || "mydb_test",
    host: DB_HOST || "127.0.0.1",
    dialect: DB_DIALECT || "mysql",
  },
  production: {
    username: DB_USERNAME || "root",
    password: DB_PASSWORD || null,
    database: process.env.DB_NAME_PROD || "mydb_prod",
    host: DB_HOST || "127.0.0.1",
    dialect: DB_DIALECT || "mysql",
  },
};

export default config;
