import { GoogleSpreadsheet } from "google-spreadsheet";
import pg from "pg";


import {decrypt_env_var} from './env_vars.mjs';
import {parseDatabaseConfig} from './database.mjs';

const new_users_report = async (event) => {
    let database = await decrypt_env_var("DATABASE");
    let dbConfig = parseDatabaseConfig(database);
    let gServiceAccount = await decrypt_env_var("SERVICE_ACCOUNT_JSON");
  
    let newComedianHeaders = [
      "first_name",
      "last_name",
      "email",
      "created_at",
      "experience",
      "bio",
    ];
    let newComedians = await get_new_comedians(dbConfig);
    await update_new_user_sheet(
      "New Comedians",
      newComedianHeaders,
      newComedians,
      gServiceAccount
    );
  
    let newFansHeaders = [
      "first_name",
      "last_name",
      "email",
      "created_at",
      "bio",
    ];
    let newFans = await get_new_fans(dbConfig);
    await update_new_user_sheet(
      "New Fans",
      newFansHeaders,
      newFans,
      gServiceAccount
    );
    console.log('Successfully updated the sheets')
    return "Updated Sheets";
  
  };
  
  const update_new_user_sheet = async (
    sheetTitle,
    headers,
    users,
    gServiceAccount
  ) => {  
    let gConfig = JSON.parse(gServiceAccount);
  
    const documentId = process.env.NEW_USERS_DOCUMENT_ID;
    console.log('Updating documentId=', documentId, 'sheetTitle=', sheetTitle);
  
    const doc = new GoogleSpreadsheet(documentId);
    await doc.useServiceAccountAuth({
      client_email: gConfig.client_email,
      private_key: gConfig.private_key,
    });
  
    await doc.loadInfo(); // loads document properties and worksheets  
  
    let sheet = doc.sheetsByTitle[sheetTitle];
  
    await sheet.clearRows();
    await sheet.setHeaderRow(headers, 1);
    await sheet.addRows(users);
  };
  
  const get_new_comedians = async (dbConfig) => {
    let results = [];
  
    let sql = `SELECT 
      "user"."firstName",
      "user"."lastName",
      "user"."email",
      "user"."createdAt",
      "user"."isComedian",
      "comedian_info"."comedyExperience",
      "comedian_info"."bio"
      
      FROM "user"
      JOIN "comedian_info" ON "comedian_info"."userId" = "user"."id"
      WHERE "user"."isComedian" = true
      ORDER BY "user"."createdAt" DESC
      LIMIT 50;`;
  
    const client = new pg.Client(dbConfig);
    await client.connect();
  
    const res = await client.query(sql, []);
  
    for (let i = 0; i < res.rows.length; i++) {
      let row = res.rows[i];
      let obj = [];
      obj.push(row.firstName);
      obj.push(row.lastName);
      obj.push(row.email);
      obj.push(row.createdAt);
      obj.push(row.comedyExperience);
      obj.push(row.bio);
      results.push(obj);
    }
  
    await client.end();
    return results;
  };
  
  const get_new_fans = async (dbConfig) => {
    let results = [];
  
    let sql = `SELECT 
      "user"."firstName",
      "user"."lastName",
      "user"."email",
      "user"."createdAt",
      "user"."isComedian",
      "fan_info"."bio"
      
      FROM "user"
      JOIN "fan_info" ON "fan_info"."userId" = "user"."id"
      WHERE "user"."isComedian" = false
      ORDER BY "user"."createdAt" DESC
  LIMIT 50;`;
  
    const client = new pg.Client(dbConfig);
    await client.connect();
  
    const res = await client.query(sql, []);
  
    for (let i = 0; i < res.rows.length; i++) {
      let row = res.rows[i];
      let obj = [];
      obj.push(row.firstName);
      obj.push(row.lastName);
      obj.push(row.email);
      obj.push(row.createdAt);
      obj.push(row.bio);
      results.push(obj);
    }
  
    await client.end();
    return results;
  };
  
  export { new_users_report };