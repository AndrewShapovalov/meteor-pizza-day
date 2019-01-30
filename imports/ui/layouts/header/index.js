import "./index.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
// collections
import { EventCollection } from "imports/api/event/event-collection";
// const
import { PubAndSubNames } from "constants";

const { GET_EVENT_LIST } = PubAndSubNames;

Template.header.onCreated(() => {
  try {
    Meteor.subscribe(GET_EVENT_LIST);
  } catch (err) {
    throw new Meteor.Error(err);
  }
});

Template.header.helpers({
  getEventListLength: () => EventCollection.find({}).count(),
  eventList: () => EventCollection.find({}),
});
