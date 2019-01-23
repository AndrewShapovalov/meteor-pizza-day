// const
import { PubAndSubNames } from "constants/index";
import { Meteor } from "meteor/meteor";
import UserGroupCollection from "../user-group-collection";

const { GET_CURRENT_USER_GROUPS } = PubAndSubNames;

UserGroupCollection.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Meteor.publish(
  GET_CURRENT_USER_GROUPS, () => UserGroupCollection.find({ ownerId: Meteor.userId() }),
);
