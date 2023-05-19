const assert = require('assert');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const { docopt } = require('docopt');

const Papa = require('papaparse');

const { getShowSubscribers, insertShowSubscriber, safeguardProduction, userIdsByEmail, validateDbEnvVars } = require('../src/database');

const DOC = `
Usage:
    bulk-register-fans <show-uuid> <path-to-csv> [--production=boolean]

Options:
    -p --production=boolean      Allow running against production databse [default: false]

Admin CLI script for automatically registering fans for a show.

    show-uuid - The Plauzzable database id for the show table
    path-to-csv - Path on the local filesystem to a CSV file with one column which contains email addresses

csv file must have a column heading "email" in the first row of the file.
`;

let args = docopt(DOC, {
    help: true
});

console.log(args);

let showId = args['<show-uuid>'];
assert(!!showId, 'A show uuid is required');

validateDbEnvVars(args);

let allowProduction = args['--production'];
safeguardProduction(allowProduction);

console.log('Updating', args['<show-uuid>'], 'based on', args['<path-to-csv>'], 'on host', process.env.DATABASE_HOSTNAME);

// Step 1 Read CSV
const csvParseCb = (results, _file) => {
    const emails = results.data.map(obj => obj.email);
    (async function () {
        let userIdMap = await userIdsByEmail(args, emails);
        let currentSubscribers = await getShowSubscribers(showId, args);
        userLookupCb(emails, userIdMap, currentSubscribers);
    })();
};

const csvParseHandleError = (error, _file) => {
    assert(false, error);
};

// Step 2 Update the DB
const userLookupCb = (emails, userIdMap, currentSubscribers) => {
    // There is no unique constraint for fanId,showId on the subscriber table
    let currentSubscribersLookup = {};
    currentSubscribers.forEach(row => currentSubscribersLookup[row.fanId] = true);

    let inviteCount = 0;
    emails.forEach(email => {
        let userUuid = userIdMap[email];
        if (!userUuid) {
            console.log(`ERROR: ${email} not found in the database`);
        } else if (currentSubscribersLookup[userUuid]) {
            console.log(`WARNING: Skipping ${email} ${userUuid} as they are already registered for ${showId}`);
        } else {
            console.log(`Inviting ${userUuid} ${email}`);
            insertShowSubscriber(showId, userUuid, args);
            inviteCount++;
        }
    });
    console.log(`Finished. Invited ${inviteCount} fans to the show`);
};

let emailCsvFilepath = path.resolve(__dirname, '../' + args['<path-to-csv>']);

Papa.parse(fs.createReadStream(emailCsvFilepath), {
    header: true,
    delimiter: ',',
    complete: csvParseCb,
    error: csvParseHandleError
});

