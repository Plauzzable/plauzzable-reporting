import pg from "pg";


import { decrypt_env_var } from '../lib/env_vars.mjs';
import { parseDatabaseConfig } from '../lib/database.mjs';
import {send_comedian_reminder_email, send_fan_reminder_email} from '../lib/reminder_email.mjs';

const upcoming_show_reminder_email_report = async (event) => {
    console.log('Running upcoming shows report');
    let database = await decrypt_env_var("DATABASE");
    let dbConfig = parseDatabaseConfig(database, "ms-shows");
    let shows = await get_upcoming_shows(dbConfig);
    console.log('Upcoming shows include:', shows);


    for (var i = 0; i < shows.length; i++) {

    }

    return "Success";
};

const get_upcoming_shows = async (dbConfig) => {

    let results = [];

    let sql = `SELECT 
                "show"."id",
                "show"."userId",
                "show"."title",
                "show"."startTime",
				Extract(epoch FROM ("startTime" - NOW())) / 60 AS minutes,
				NOW()

                FROM "show"
                WHERE "startTime" > NOW() AND
                "startTime" <= NOW() + INTERVAL '1 day';`; // 15 minutes

    dbConfig.database = "ms-shows";
    const client = new pg.Client(dbConfig);
    await client.connect();

    const res = await client.query(sql, []);
    
    let showIds = [];
    let userIds = [];

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        let obj = {
            id: row.id,
            userId: row.userId,
            title: row.title,
            startTime: row.startTime,
            minutes: row.minutes,
            now: row.now,
            audience: []
        };
        results.push(obj);
        showIds.push(row.id);
        // Collect Comedians
        userIds.push(row.userId);
    }

    console.log('after first query we have', results);
    await client.end();

    console.log('calling into get_audience_for_shows', showIds);
    let audienceDetails = await get_audience_for_shows(dbConfig, showIds);
    let audiencesByShowId = {};
    console.log('PROCESSING audienceDetails', audienceDetails);

    for (let i=0; i < audienceDetails.length; i++) {
        let audienceDetail = audienceDetails[i];
        if (! audiencesByShowId[audienceDetail.showId]) {
            audiencesByShowId[audienceDetail.showId] = [];
        }
        audiencesByShowId[audienceDetail.showId].push(audienceDetail.fanId);        
        console.log('adding fanId to usersIds', audienceDetail.fanId);
        // Collect Audience members
        userIds.push(audienceDetail.fanId);
    }

    console.log('calling into get_user_contact_info', userIds);

    let usersById = await get_user_contact_info(dbConfig, userIds);


    for (let i=0; i < results.length; i++) {
        let show = results[i];
        show.comedian = user_contact_info(show.userId, usersById);
        
        let audience = audiencesByShowId[show.id];
        if (!audience || !audience.length) {
            // TODO: Does this mean there are no fans? Can we prefill audiencesByShowId[show.id] with an empty array?
            console.log('WARNING unable to pull show.id from show=', show, 'and audience map=', audiencesByShowId);
            continue;
        }

        for (let j=0; j < audience.length; j++) {
            let fanId = audience[j];
            show.audience.push(user_contact_info(fanId, usersById));
        }
        await send_comedian_reminder_email(show);
        // TODO: TEsting only send one
        console.log('AOK only send one');
        break;
    }

    if (results.length == 0) {
        console.log('No shows in the next 15 minutes, so no emails have been sent');
    }

    return "Emails Sent";
};

const user_contact_info = (userId, usersById) => {
return usersById[userId];
};

const get_audience_for_shows = async (dbConfig, showIds) => {
    let results = [];
// TODO: is this expectant or subscriber?
 /* TODO: look at the results and count audience against db results for shows
 
    id: '155357ba-59fa-4102-9bed-04aec7ae6974',
    userId: 'b5566da0-1b3d-43a5-ac63-2d4ee28d065f',
    title: 'Sets Prepared Mic',
    startTime: 2023-03-03T01:00:00.000Z,
    audience: [ undefined, undefined, undefined, undefined ],
    comedian: {
      id: 'b5566da0-1b3d-43a5-ac63-2d4ee28d065f',
      firstName: 'Chad',
      lastName: 'Shapiro',
      email: 'chad@chadshapiro.com'
    }
  },
  {
    id: '3f59d712-3997-43e9-84ec-fb5034992732',
    userId: '06e2439c-9360-46cd-8b29-63ae5f79f0bc',
    title: 'Hump Day Happy Hour & Trivia Open Mic',
    startTime: 2023-03-02T02:30:00.000Z,
    audience: [ undefined, undefined, undefined, undefined, undefined ],
    comedian: {
      id: '06e2439c-9360-46cd-8b29-63ae5f79f0bc',
      firstName: 'Rich',
      lastName: 'Collier',
      email: 'rcollier2@gmail.com'
    }
  },
  {
    id: '60edcdf4-f0ea-41a9-8138-5769bad95baa',
    userId: 'e9290b71-708b-4bc2-9d66-98c31aa0b659',
    title: 'Plauzzable 101',
    startTime: 2023-03-02T17:00:00.000Z,
    audience: [ undefined, undefined, undefined ],
    comedian: {
      id: 'e9290b71-708b-4bc2-9d66-98c31aa0b659',
      firstName: 'Leanne',
      lastName: 'Linsky',
      email: 'leannelinsky@yahoo.com'
    }
 */
    let sql = `SELECT "showId", "fanId" 
    FROM "subscriber" WHERE "showId" = ANY ($1);`;

    console.log(sql, showIds);

    // Change database schemas
    dbConfig.database = "ms-shows";
    const client = new pg.Client(dbConfig);
    await client.connect();

    const res = await client.query(sql, [showIds]);

    console.log('PROCESS RESULTS get_audience_for_shows');

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        results.push({
            showId: row.showId,
            fanId: row.fanId,
        });
    }
    await client.end();
    console.log('RESULTS get_audience_for_shows', results);
    return results;
};

const get_user_contact_info = async (dbConfig, userIds) => {
    console.log('Getting user contact info', userIds);
    let results = {};

    let sql = `SELECT "id", "firstName", "lastName", "email" 
    FROM "user" WHERE "user"."id" = ANY ($1);`;

    // Change database schemas
    dbConfig.database = "ms-users";
    const client = new pg.Client(dbConfig);
    await client.connect();

    const res = await client.query(sql, [userIds]);

    console.log('PROCESS RESULTS get_user_contact_info');

    for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows[i];
        results[row.id] = {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
        };
    }
    await client.end();
    console.log('RESULTS  get_user_contact_info', results);
    return results;
};

export { upcoming_show_reminder_email_report };