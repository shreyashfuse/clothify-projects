require("dotenv").config();

const { Temporal } = require("@js-temporal/polyfill");

globalThis.Temporal = Temporal;

const postgres = require("@prisma/orm-postgres/runtime").default;

const contract = require("../../prisma/contract.json");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const db = postgres({
  contractJson: contract,
  url: databaseUrl,
});

module.exports = db;