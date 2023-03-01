import {new_users_report} from './new_users_report.mjs';

const NEW_USERS_REPORT = 'new-users-report';

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
  if (reportType == NEW_USERS_REPORT) {
    return new_users_report(event);
  } else {
    console.error('Unknown report-type [', reportType, '] skipping.');
    throw new Error('Unknown report-type ' + reportType);
  }
};