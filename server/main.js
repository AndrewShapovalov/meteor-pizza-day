import "/imports/startup/server";

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

if (Meteor.settings && Meteor.settings.private && Meteor.settings.private.oAuth) {
  const { oAuth: { google } } = Meteor.settings.private;

  createServiceConfiguration("google", google.clientId, google.secret);
}
