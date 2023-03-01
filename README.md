# Plauzzable Reporting

Scripts that run periodically for reporting and other purposes

## Infrastructure

[SAM](./docs/SAM.md) based Lambda for various reporting and cron-like jobs.

"Cron" fascilities are provided by Lambda step functions (aka CloudWatch Event Bridge).

## Lambdas

Currently there is only one lambda project. Creating as a sub-folder in case we need to have multiple sub-projects in the future.

* plauz-report-new-users


## Dev versus Production

Currently I am using two different AWS accounts. I first push to a local account to test.

## Development

Docker and SAM are requirements.

    cd plauz-report-new-users
    sam build
    sam invoke local

## Deployment

You can use `--no-confirm-changeset` to skip the last question.

    sam build
    sam deploy --guided  --profile plauzzable