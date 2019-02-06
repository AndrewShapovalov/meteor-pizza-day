import { Meteor } from "meteor/meteor";
// const
import { PubAndSubNames } from "../../../../imports/startup/both/constants/index";
import { EventCollection } from "../event-collection";

const { GET_EVENT_LIST } = PubAndSubNames;

EventCollection.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

try {
  Meteor.publish(GET_EVENT_LIST, () => EventCollection.find({ users: { $elemMatch: { _id: Meteor.userId() } } }));
} catch (err) {
  throw new Meteor.Error(err);
}
