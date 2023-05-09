const assert = require('assert');
const path = require('path');
const { readFile } = require('fs/promises');

const { Client } = require('pg');

// Protects CLI from accidentally running against production.
// NOTE: If we change DB hostnames, we must update this script
const PRODUCTION_HOST = 'plauzzable-prod.cck1jk6oluev.us-east-1.rds.amazonaws.com';

const validateDbEnvVars = (args) => {
    const VARS = [
        'DATABASE_HOSTNAME',
        'DATABASE_PORT',
        'DATABASE_USERNAME',
        'DATABASE_PASSWORD'
    ];
    VARS.forEach(envVar => {
        let value = process.env[envVar];
        assert(!!value && value.trim().length > 0, `Expected ${envVar} to be set, but it is not. See README.md`);

    });

    let port = dbPort();
    assert(!isNaN(port) && port > 0, `Expected DATABASE_PORT to be an integer, not ${port}`);

    if (process.env.DATABASE_HOSTNAME == 'plauzzable-prod.cck1jk6oluev.us-east-1.rds.amazonaws.com') {
        assert(false, 'Your environment variables are set to production, please use --production flag to acknowledge. See --help.')
    }
};

const prepareDbConfig = (args, pgSchema) => {
    return {
        host: process.env.DATABASE_HOSTNAME,
        port: dbPort(),
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: pgSchema,
    };
};

const ensureShowIsPrivate = async (showId, args) => {
    let sql = await loadSql('../sql/update_show_isprivate.sql');

    let client = new Client(prepareDbConfig(args, 'ms-shows'));

    client.connect();
    let result = await client.query(sql, [showId]);
    client.end();

    assert(result.rowCount == 1,
        `${result.rowCount} shows updated. Expected ${showId} to match one show in ${process.env.DATABASE_HOSTNAME}.
Double check show id and database hostname.`);


}

// Given a list of emails, returns an object with email as the key and user uuid as the value
const userIdsByEmail = async (args, emails) => {
    let sql = await loadSql('../sql/user_ids_by_email.sql');
    let client = new Client(prepareDbConfig(args, 'ms-users'));

    client.connect();
    let result = await client.query(sql, [emails]);
    client.end();

    let users = {};
    result.rows.forEach(row => users[row.email] = row.id);
    return users;
};

// Returns a list of subscribers for a show
const getShowSubscribers = async (showId, args) => {
    let sql = 'SELECT "fanId" FROM subscriber WHERE "showId" = $1';
    let client = new Client(prepareDbConfig(args, 'ms-shows'));
    client.connect();
    try {
        let result = await client.query(sql, [showId]);
        return result.rows;
    } catch (err) {
        console.log(`WARNING: ${fanId} was already in ${showId} or something else has caused an error ${err}`);
    } finally {
        client.end();
    }
};

const insertShowSubscriber = async (showId, fanId, args) => {
    let sql = await loadSql('../sql/insert_show_subscriber.sql');
    let client = new Client(prepareDbConfig(args, 'ms-shows'));

    client.connect();
    try {
        let result = await client.query(sql, [fanId, showId]);
    } catch (err) {
        console.log(`WARNING: ${fanId} was already in ${showId} or something else has caused an error ${err}`);
    } finally {
        client.end();
    }
};

const safeguardProduction = (allowProduction) => {
    if (process.env.DATABASE_HOSTNAME == PRODUCTION_HOST) {
        assert(allowProduction == 'true',
            'Environment variables are pointed to a production database server. Please confirm you want to update production with the --production=true.')
    }
}

const dbPort = () => parseInt(process.env.DATABASE_PORT, 10);
const loadSql = async (filename) => await readFile(path.resolve(__dirname, filename), {
    encoding: 'utf8'
});

exports.ensureShowIsPrivate = ensureShowIsPrivate;
exports.getShowSubscribers = getShowSubscribers;
exports.insertShowSubscriber = insertShowSubscriber;
exports.safeguardProduction = safeguardProduction;
exports.userIdsByEmail = userIdsByEmail;
exports.validateDbEnvVars = validateDbEnvVars;