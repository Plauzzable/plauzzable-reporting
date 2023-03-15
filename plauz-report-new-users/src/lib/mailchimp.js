// Unused but commiting to git for future reference

import MailChimp from "@mailchimp/mailchimp_transactional";

/*
Show:  {
    id: '60edcdf4-f0ea-41a9-8138-5769bad95baa',
    userId: 'e9290b71-708b-4bc2-9d66-98c31aa0b659',
    title: 'Plauzzable 101',
    startTime: 2023-03-02T17:00:00.000Z,
    audience: [ {...}, {...}, {...} ],
    comedian: {
      id: 'e9290b71-708b-4bc2-9d66-98c31aa0b659',
      firstName: 'Leanne',
      lastName: 'Linsky',
      email: 'leannelinsky@yahoo.com'
    }
  }
*/

const send_fan_reminder_email = (show) => {
    const link = `https://plauzzable.com/live-show/?showId=${show.id}&comedianId=${show.userId}`;

    console.log(typeof show.startTime, Object.keys(show.startTime));

    // TODO: STARTTIME
    const displayStartTime = show.startTime;
    const subject = `Your comedy show starts soon on Plauzzable`;
    const body = `Hey ${show.firstName},
${show.title} starts at ${displayStartTime}.
${link}

These reminder emails are a new beta feature. Got feedback? Please reply.
Thanks,
Leanne

*|UNSUB:http://example.com/unsub|*
`;

};

const send_comedian_reminder_email = async (show) => {    

    const link = `https://plauzzable.com/live-show/?showId=${show.id}&comedianId=${show.userId}`;

    console.log(typeof show.startTime, Object.keys(show.startTime));

    const displayStartTime = show.startTime;
    const subject = `Your comedy show starts soon on Plauzzable`;
    const body = `Hey ${show.comedian.firstName},
${show.title} starts soon! Click the link below to join:
${link}

These reminder emails are a new beta feature. Got feedback? Please reply.

Thanks,
Leanne

To unsubscribe *|UNSUB:https://plauzzable.com|*
`;

const htmlBody = `Hey ${show.comedian.firstName},<br />
<p><b>${show.title}</b> starts soon! Click the link below to join:</p>
<p><a href="${link}">plauzzable.com</a></p><br />

<p><i>These reminder emails are a new beta feature. Got feedback? Please reply.</i></p>
<p>Thanks,<br />
Leanne</p>
<br /><br />
Click here to <a href="*|UNSUB:https://plauzzable.com|*">un-subscribe</a>.
`;

// TODO: encrypt

    const mailchimpTx = MailChimp("<API SECRET>");
    console.log('Sending comedian email with show=', show);

    // Development note: Free tier account can only email the verified domain from the verified domain...

    // leanne.linsky@plauzzable.com
  const response = await mailchimpTx.messages.send({
    message: {
        // from: 'Leanne Linsky <leanne@opsdrill.com>',
        from_email: 'leanne@opsdrill.com',
        from_name: 'Leanne Linsky',
        // from_name: 'Leanne Linsky',
        to: [{
            // show.comedian.email
            email: 'opt-out@opsdrill.com',
            name: `${show.comedian.firstName} ${show.comedian.lastName}`,
            type: 'to'
        }],
        subject: subject,
        text: body,
        html: htmlBody,
        headers: {
            "Reply-To:": "Leanne Linsky <leanne@opsdrill.com>"
        },
        important: false
        
    }
  })
  console.log(response);

};

export {send_comedian_reminder_email, send_fan_reminder_email};