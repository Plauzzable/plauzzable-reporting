# Send In Blue

## NodeJS docs

https://github.com/sendinblue/APIv3-nodejs-library

## Email Templates

Email templates are managed in https://editor.sendinblue.com/

Variables in an email are called "Attributes" and are associated with either the contact or we inject them with the API call.
For them to be useful in the editor, they must exist in their system.

## Using existing Attributes

The WYSIWYG template editor knows about the Contact's attributes like firstname. Those can be inserted via the WYSIWYG or in code via `{{ contact. FIRSTNAME }}

## Adding New Attributes 

New attributes are passed into the API call via parameters. They can be referenced in an email template as 

    {{ params.SHOW_LINK }}

