import SibApiV3Sdk from "sib-api-v3-sdk";
var defaultClient = SibApiV3Sdk.ApiClient.instance;

import { decrypt_env_var } from './env_vars.mjs';

const SENDINBLUE_REMINDER_FAN_TEMPLATE_ID = 2;

const send_show_reminder_email = async (show) => {

  let recipient = show.comedian;
  await _send_reminder(recipient, show);
  for (let i = 0; i < show.audience.length; i++) {
    let recipient = show.audience[i];
    await _send_reminder(recipient, show);
  }
};

const _send_reminder = async (recipient, show) => {
  const FIRSTNAME = recipient.firstName;
  const SHOWTITLE = show.title;
  const SHOWLINK = `https://plauzzable.com/live-show/?showId=${show.id}&comedianId=${show.userId}`;

  let minutes = Math.round(show.minutes);
  const STARTSINMINUTES = minutes > 1 ? 'in ' + minutes + ' minutes' : 'now';

  // Used for debugging only
  const STARTTIME = show.startTime;
  const NOW = show.now;

  // Validate we can send an email
  const TO = `${recipient.firstName} ${recipient.lastName}`;
  if (TO.trim() == '') {
    console.log(`Skipping ${recipient.email} as they have no first and last name set`);
    return "SKIPPING";
  }

  var apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = await decrypt_env_var('SENDINBLUE_API_KEY');

  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail = {
    to: [{
      // TODO: test opt out - do we need to create contacts on our side?
      email: `${recipient.email}`,
      name: TO
    }],
    templateId: SENDINBLUE_REMINDER_FAN_TEMPLATE_ID,
    params: {
      FIRSTNAME,
      SHOWTITLE,
      SHOWLINK,
      STARTSINMINUTES,
      STARTTIME,
      NOW
    }
  };

  await new Promise((resolve, reject) => {
    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
      console.log('SendInBlue API called successfully. Returned data: ' + data);
      resolve(data);
    }, function (error) {
      console.log('ERROR SendInBlue API called failed, please investigate');
      console.error(error);
      // To avoid re-tries, we will resolve instead of reject(error)
      resolve(data);
    });
  });
};

export { send_show_reminder_email };