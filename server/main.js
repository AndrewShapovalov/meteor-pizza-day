import "/imports/startup/server";

/*
const createServiceConfiguration = (service, clientId, secret) => {
  ServiceConfiguration.configurations.remove({
    service,
  });

  const config = {
    service,
    clientId,
    secret,
  };

  ServiceConfiguration.configurations.insert(config);
};

if (Meteor.settings && Meteor.settings.private) {
  const {
    smtp,
    oAuth: { google },
  } = Meteor.settings.private;
  process.env.MAIL_URL = smtp;
  createServiceConfiguration("google", google.clientId, google.secret);
}
*/

Meteor.startup(() => {
  process.env.MAIL_URL = "smtp://apikey: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@smtp.sendgrid.net:2525";
});

const SERVICE = "google";

ServiceConfiguration.configurations.remove({
  service: SERVICE,
});

const config = {
  service: SERVICE,
  clientId: "227480052102-jqvap45jb38repvgr7o1ks90j86p34ch.apps.googleusercontent.com",
  secret: "TgFIyt2fL9vKJxCnJKhcyAZQ",
};

ServiceConfiguration.configurations.insert(config);
