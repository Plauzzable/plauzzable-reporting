import {admin_analytics_report} from '../jobs/admin_analytics_report.mjs';
import {new_users_report} from '../jobs/new_users_report.mjs';
import {upcoming_show_reminder_email_report} from '../jobs/upcoming_shows_reminder_email.mjs';

const ADMIN_ANALYTICS_REPORT = 'admin-analytics-report';
const NEW_USERS_REPORT = 'new-users-report';
const UPCOMING_SHOWS_REPORT = 'upcoming-shows-report';

/**
 * A Lambda function that returns a static string
 */
export const plauzReportLambdaHandler = async (event) => {
  console.log('newest version from plauzReportLambdaHandler');
  // Route the request
  if (!event || ! event['report-type']) {
    throw new Error('Expected report-type property');
  }
  let reportType = event['report-type'];
  if (reportType == ADMIN_ANALYTICS_REPORT) {
    return admin_analytics_report(event);
  } else if (reportType == NEW_USERS_REPORT) {
      return new_users_report(event);
  } else if (reportType == UPCOMING_SHOWS_REPORT) {
      return upcoming_show_reminder_email_report(event);
  } else {
    console.error('Unknown report-type [', reportType, '] skipping.');
    throw new Error('Unknown report-type ' + reportType);
  }
};