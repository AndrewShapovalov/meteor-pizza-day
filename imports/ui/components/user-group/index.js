import "./index.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
// const
import { PubAndSubNames } from "../../../../constants/index";
import UserGroupCollection from "../../../api/user-group/user-group-collection";

const { USER_GROUP_ALL } = PubAndSubNames;

if (Meteor.isClient) {
  Template.body.onCreated(() => Meteor.subscribe(USER_GROUP_ALL));
}

Template.userGroup.helpers({
  userGroupCollection: () => UserGroupCollection.find(),
});
