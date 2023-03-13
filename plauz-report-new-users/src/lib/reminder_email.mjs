import SibApiV3Sdk from "sib-api-v3-sdk";
var defaultClient = SibApiV3Sdk.ApiClient.instance;

import { decrypt_env_var } from './env_vars.mjs';

const SENDINBLUE_REMINDER_FAN_TEMPLATE_ID = 2;

const send_fan_reminder_email = (show) => {
  // TODO: Building out send_comedian first
};

const send_comedian_reminder_email = async (show) => {
  const FIRSTNAME = show.comedian.firstName;
  const SHOWTITLE = show.title;
  const SHOWLINK = `https://plauzzable.com/live-show/?showId=${show.id}&comedianId=${show.userId}`;

  let minutes = Math.round(show.minutes);
  const STARTSINMINUTES = minutes > 1 ? 'in ' + minutes + ' minutes' : 'now';
    
  // Used for debugging only
  const STARTTIME = show.startTime;
  const NOW = show.now;

  var apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = await decrypt_env_var('SENDINBLUE_API_KEY');
  
  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail = {
    to: [{
      // show.comedian.email
      email: 'opt-out@opsdrill.com',
      name: `${show.comedian.firstName} ${show.comedian.lastName}`
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
      console.log('SendInBlue API called failed');
      console.error(error);
      reject(error);
    });
  });
  

};

export { send_comedian_reminder_email, send_fan_reminder_email };