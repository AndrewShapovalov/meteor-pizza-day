import { Meteor } from "meteor/meteor";
// const
import { PubAndSubNames } from "constants/index";
import UserGroupCollection from "../user-group-collection";

const { GET_CURRENT_USER_GROUPS } = PubAndSubNames;

UserGroupCollection.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

try {
  Meteor.publish(
    GET_CURRENT_USER_GROUPS,
    () => UserGroupCollection.find({ ownerId: Meteor.userId() }),
  );
} catch (err) {
  throw new Meteor.Error(err);
}