import { Meteor } from "meteor/meteor";
// const
import { PubAndSubNames } from "imports/startup/both/constants/index";
import UserGroupCollection from "../user-group-collection";

const { GET_CURRENT_USER_GROUPS } = PubAndSubNames;

UserGroupCollection.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

try {
  Meteor.publish(GET_CURRENT_USER_GROUPS, () => UserGroupCollection.find({ users: { $elemMatch: { _id: Meteor.userId() } } }));
} catch (err) {
  throw new Meteor.Error(err);
}
