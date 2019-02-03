// Server entry point, imports all server code
import { Meteor } from "meteor/meteor";
// import '/imports/startup/both';
import "/imports/startup/server";

Meteor.startup(() => {
  process.env.MAIL_URL = "smtp://postmaster%40sandbox073e7bf179b74d6a808aa1a43e0528d5.mailgun.org:923ba18e8ad6c18d88719f9a5ea4ca59-c8c889c9-da5ff88c@smtp.mailgun.org:2525";
});
