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

if (Meteor.settings && Meteor.settings.oAuth) {
  const {
    oAuth: { google },
  } = Meteor.settings;

  createServiceConfiguration("google", google.clientId, google.secret);
}
