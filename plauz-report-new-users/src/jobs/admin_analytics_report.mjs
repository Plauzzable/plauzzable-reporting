import path from 'path';

import { readFile } from 'fs/promises';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import pg from "pg";

import { decrypt_env_var } from '../lib/env_vars.mjs';
import { parseDatabaseConfig } from '../lib/database.mjs';

const admin_analytics_report = async (event) => {
    console.log('Running new users report');
    let database = await decrypt_env_var("DATABASE");
    let gServiceAccount = await decrypt_env_var("SERVICE_ACCOUNT_JSON");

    let newAdminAnalyticsDailyHeaders = [
        "date",
        "total_free_shows",
        "free_shows_created",

        "total_paid_shows",
        "paid_shows_created",

        "avg_registered_users",

        "total_fan_accounts",
        "fan_accounts_created",

        "total_comedian_accounts",
        "comedian_accounts_created",

        // Average show duration is based of start and end time
        // and doesn't reflect actual show length that the jitsi meeting took
        "avg_show_duration",

        "avg_plauzz_given",
        "avg_comments_given",
        "avg_viewers_given",
    ];

    // Compare the header length to the most recently added _IDX constant
    if (newAdminAnalyticsDailyHeaders.length != LAST_IDX + 1) {
        console.log('ERROR: Header and Row values mismatch detected! Please update both pieces of code.');
        return "Error";
    }

    let newAdminAnalytics = await get_admin_analytics_daily(database);
    await update_admin_analytics_daily_sheet(
        format_today_month(),
        newAdminAnalyticsDailyHeaders,
        newAdminAnalytics,
        gServiceAccount
    );
    console.log('Successfully updated the sheets')
    return "Updated Sheets";

};


const update_admin_analytics_daily_sheet = async (
    sheetTitle,
    headers,
    adminAnalyticsDailyRow,
    gServiceAccount
) => {
    let gConfig = JSON.parse(gServiceAccount);

    const documentId = process.env.ADMIN_ANALYTICS_DAILY_DOCUMENT_ID;
    console.log('Updating documentId=', documentId, 'sheetTitle=', sheetTitle);

    const doc = new GoogleSpreadsheet(documentId);
    await doc.useServiceAccountAuth({
        client_email: gConfig.client_email,
        private_key: gConfig.private_key,
    });

    await doc.loadInfo();

    let sheet = doc.sheetsByTitle[sheetTitle];
    if (sheet == null) {
        console.log('Sheet does not exist, creating it');
        await doc.addSheet({
            title: sheetTitle,
            headerValues: headers,

        });
        sheet = doc.sheetsByTitle[sheetTitle];
        if (sheet == null) {
            console.log('ERROR: Unable to create sheet');
            return;
        }
    }
    await sheet.addRow(adminAnalyticsDailyRow);
};

//                     Hour Min  Sec  Milliseconds
const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;

const TODAY_DATE_IDX = 0;
const TOTAL_FREE_SHOWS_IDX = 1;
const FREE_SHOWS_CREATED_IDX = 2;
const TOTAL_PAID_SHOWS_IDX = 3;
const PAID_SHOWS_CREATED_IDX = 4;
const AVG_REGISTERED_USERS_IDX = 5;
const TOTAL_FAN_ACCOUNTS_IDX = 6;
const FAN_ACCOUNTS_CREATED_IDX = 7;
const TOTAL_COMEDIAN_ACCOUNTS_IDX = 8;
const COMEDIAN_ACCOUNTS_CREATED_IDX = 9;
const AVG_SHOW_DURATION_IDX = 10;
const AVG_PLAUZZ_GIVEN_IDX = 11;
const AVG_COMMENTS_GIVEN_IDX = 12;
const AVG_VIEWERS_GIVEN_IDX = 13;

// Update this to the most recently added _IDX constant
const LAST_IDX = AVG_VIEWERS_GIVEN_IDX;

const get_admin_analytics_daily = async (database) => {
    let results = Array(LAST_IDX).fill(0); // TODO empty string

    results[TODAY_DATE_IDX] = format_yesterday_label();

    const clientShowsDb = new pg.Client(parseDatabaseConfig(database, "ms-shows"));
    await clientShowsDb.connect();
    await query_total_shows(results, clientShowsDb);
    await query_shows_created(results, clientShowsDb);
    await query_average_registered_users(results, clientShowsDb);
    await query_average_show_duration(results, clientShowsDb);
    await query_average_show_statistics(results, clientShowsDb);
    await clientShowsDb.end();

    const clientUsersDb = new pg.Client(parseDatabaseConfig(database, "ms-users"));
    await clientUsersDb.connect();
    await query_total_accounts(results, clientUsersDb);
    await query_accounts_created(results, clientUsersDb);
    await clientUsersDb.end();

    return results;
};

const format_yesterday_label = () => {
    let now = new Date();
    now.setTime(now.getTime() - ONE_DAY_MILLIS);

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(now.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const format_today_month = () => {
    let now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-based

    return `${year}-${month}`;
}

const query_total_shows = async (results, client) => {
    let sql = await loadSql('./sql/total_shows.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        if (row.is_free) {
            results[TOTAL_FREE_SHOWS_IDX] = row.show_count;
        } else {
            results[TOTAL_PAID_SHOWS_IDX] = row.show_count;
        }
    }
};

const query_shows_created = async (results, client) => {
    let sql = await loadSql('./sql/shows_created.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        if (row.is_free) {
            results[FREE_SHOWS_CREATED_IDX] = row.show_count;
        } else {
            results[PAID_SHOWS_CREATED_IDX] = row.show_count;
        }
    }
};

const query_average_registered_users = async (results, client) => {
    let sql = await loadSql('./sql/avg_registered_users.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        results[AVG_REGISTERED_USERS_IDX] = row.average_subscribers;
        break;
    }
};

const query_total_accounts = async (results, client) => {
    let sql = await loadSql('./sql/total_accounts.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        if (row.is_comedian) {
            results[TOTAL_COMEDIAN_ACCOUNTS_IDX] = row.number_of_accounts;
        } else {
            results[TOTAL_FAN_ACCOUNTS_IDX] = row.number_of_accounts;
        }
    }
};


const query_accounts_created = async (results, client) => {
    let sql = await loadSql('./sql/accounts_created.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        if (row.is_comedian) {
            results[COMEDIAN_ACCOUNTS_CREATED_IDX] = row.number_of_accounts;
        } else {
            results[FAN_ACCOUNTS_CREATED_IDX] = row.number_of_accounts;
        }
    }
};

const query_average_show_duration = async (results, client) => {
    let sql = await loadSql('./sql/avg_show_duration.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        results[AVG_SHOW_DURATION_IDX] = row.average_duration_minutes;
        break;
    }
};

const query_average_show_statistics = async (results, client) => {
    let sql = await loadSql('./sql/avg_show_statistics.sql');
    const res = await client.query(sql, []);

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        results[AVG_PLAUZZ_GIVEN_IDX] = row.avg_reactions || 0;
        results[AVG_COMMENTS_GIVEN_IDX] = row.avg_comments || 0;
        results[AVG_VIEWERS_GIVEN_IDX] = row.avg_viewers || 0;
        break;
    }
};

const loadSql = async (filename) => await readFile(path.resolve(filename), {
    encoding: 'utf8'
});

export { admin_analytics_report };