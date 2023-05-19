# Plauz Admin

## First time setup

    npm install

## DB - First time setup

Many CLI commands operate on the database. The credentials are passed via environment variables.

    cp env.example .env
    # Edit .env with correct credentials

## CLI tools

Execute from the current directory of this repo:

* `node convert-to-corporate-show.js --help` Converts a Free Show to a Corporate Show
* `node bin/bulk-register-fans.js --help` Automatically invites Fans to a Show