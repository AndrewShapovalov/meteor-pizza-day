// const
import { PubAndSubNames } from "constants/index";
import { Meteor } from "meteor/meteor";
import UserGroupCollection from "../user-group-collection";

const { USER_GROUP_ALL } = PubAndSubNames;

if (Meteor.isServer) {
  UserGroupCollection.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
  });

  Meteor.publish(USER_GROUP_ALL, () => UserGroupCollection.find({ id: { $ne: 3 } }));
}
