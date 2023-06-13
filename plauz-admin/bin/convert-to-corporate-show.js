const assert = require('assert');

require('dotenv').config();

const { docopt } = require('docopt');

const { ensureShowIsPrivate, safeguardProduction, validateDbEnvVars } = require('../src/database');

const DOC = `
Usage:
    covert-to-corparate-show <show-uuid> [--production=boolean]

Options:
    -p --production=boolean      Allow running against production databse [default: false]

Admin CLI script for converting a Free show into a Corporate Show

show-uuid - The Plauzzable database id for the show table
`;

let args = docopt(DOC, {
    help: true
});

let showId = args['<show-uuid>'];
assert(!!showId, 'A show uuid is required');


validateDbEnvVars(args);

let allowProduction = args['--production'];
safeguardProduction(allowProduction);


console.log('Updating', args['<show-uuid>'], process.env.DATABASE_HOSTNAME);

(async function () {
    await ensureShowIsPrivate(showId, args);
})();
