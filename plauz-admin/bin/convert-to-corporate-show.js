const assert = require('assert');

require('dotenv').config();

const { docopt } = require('docopt');

const { ensureShowIsPrivate, validateDbEnvVars } = require('../src/database');

const DOC = `
Usage:
    covert-to-corparate-show <show-uuid>

Admin CLI script for converting a Free show into a Corporate Show

show-uuid - The Plauzzable database id for the show table

NOTE: This script connects to our Postgres DB based on the following environment variables
which must be set:
* 
* 
* 
* 
`;

let args = docopt(DOC, {
    help: true
});

let showId = args['<show-uuid>'];
assert(!!showId, 'A show uuid is required');


validateDbEnvVars(args);


console.log('Updating', args['<show-uuid>'], process.env.DATABASE_HOSTNAME);

(async function () {
    await ensureShowIsPrivate(showId, args);
})();
