# Plauzzable Reporting

Scripts that run periodically for reporting and other purposes.

## Infrastructure

[SAM](./docs/SAM.md) based Lambda for various reporting and cron-like jobs.

"Cron" fascilities are provided by Lambda step functions (aka CloudWatch Event Bridge).

## Lambdas

Currently there is only one lambda project. Creating as a sub-folder in case we need to have multiple sub-projects in the future.

* new-users-report
* upcoming-shows-report
* admin-analytics-report

### Lambda Configuration

The following ENV variables are set in order for our Lambda to function properly.
Some of them are encrypted with AWS KMS.

DATABASE - Encrypted Value
NEW_USERS_DOCUMENT_ID - 1FbJZ39zcJLXS8oHJnPm9Qbti8qhjO5ySETUBCp3TTOk
SENDINBLUE_API_KEY - Encrypted
SERVICE_ACCOUNT_JSON - Encrypted

After decyrpting `DATABASE`, the value is a pipe delimited string. `host|port|user|password`.

For example:

    localhost|5432|postgres|P4$$W0RD

The `NEW_USERS_DOCUMENT_ID` is the document id. It can be found in the url of a Google Sheet. For example the sheet https://docs.google.com/spreadsheets/d/1FbJZ39zcJLXS8oHJnPm9Qbti8qhjO5ySETUBCp3TTOk/edit#gid=0 has the document ID `1FbJZ39zcJLXS8oHJnPm9Qbti8qhjO5ySETUBCp3TTOk`.

SENDINBLUE_API_KEY and SERVICE_ACCOUNT_JSON are example what is given in the developer console of SendInBlue and Google respectively.

### New Users Report

`new-users-report` - Runs hourly and populates the sheet with the 50 most recent Fan and Comedian sign-ups.

The following ENV variables must be set in the Lambda configuration

* NEW_USERS_DOCUMENT_ID - A google sheets docs ID. Example: 1d-4oHdCPDp6Vl0EsU0K5R2yK_j4T91-YTLJY3EK-UT0

### Upcoming Shows Reminder Emails

`upcoming-shows-report` - Runs every 15 minutse. Finds shows that will start in the next 15 minutes. Sends an email with a link to the show.

### Admin Analytics

Runs once per day and aggregates daily statistics into a Google Sheet.

* ADMIN_ANALYTICS_DAILY_DOCUMENT_ID - - A google docs ID.

## Dev versus Production

Currently I am using two different AWS accounts. I first push to a local account to test.

    # backup prod
    cp samconfig.toml samconfig.toml-plauz
    cp samconfig.toml-dev samconfig.toml

**DO NOT TRY TO VIEW PRODUCTION ENV VARIABLES**

Lambda config that has been encrypted with KMS is not viewable.

You should create a new developer account and setup your own SAM stack for development.

In production you can add new ENV variables, but do not alter existing ones unless their values change.

## Development Deployment

Docker and SAM are requirements.

    cd plauz-report-new-users
    sam build
    # local dev not available currently due to encryption, etc
    # sam invoke local
    # or
    sam deploy --profile test-account --no-confirm-changeset  --s3-bucket aws-sam-cli-managed-default-samclisourcebucket-p5ttohscjlag

If you look at your Lambda in the console UI you should see "Updated ... seconds ago"

You should test it on the lambda console with various example payloads. See production lambda config to get copies of these test inputs.

## Production Deployment

You can use `--no-confirm-changeset` to skip the last question.

    sam build
    sam deploy --guided  --profile plauzzable