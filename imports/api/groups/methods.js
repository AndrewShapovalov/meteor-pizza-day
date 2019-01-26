/* eslint meteor/audit-argument-checks: 0 */

import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
// const
import { MethodNames } from "constants/index";
// collections
import UserGroupCollection from "imports/api/groups/user-group-collection";
// own helpers
import { getGroupOwnerId } from "helpers";

const {
  GET_GROUP_BY_ID,
  CREATE_GROUP,
  ADD_USER_TO_GROUP,
  REMOVE_USER_FROM_GROUP,
} = MethodNames;

const checkGroupIdAndUser = (groupId, user) => {
  check(user, Object);
  const { _id, name } = user;
  check(_id, String);
  check(name, String);
  check(groupId, String);
};

Meteor.methods({
  [GET_GROUP_BY_ID](groupId) {
    check(groupId, String);
    return UserGroupCollection.find({ _id: groupId });
  },
  [CREATE_GROUP]({ name, logo }) {
    check(name, String);
    check(logo, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const menu = JSON.parse(Assets.getText("menu.json"));


    const currentUser = Meteor.user();
    const userId = Meteor.userId();

    const dataForStorage = {
      name,
      logo,
      menu,
      items: [],
      ownerId: userId,
      users: [
        {
          _id: userId,
          name: currentUser && currentUser.profile.name,
        },
      ],
    };

    UserGroupCollection.insert(dataForStorage);
  },
  [ADD_USER_TO_GROUP](groupId, user) {
    checkGroupIdAndUser(groupId, user);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }
    UserGroupCollection.update({ _id: groupId }, { $push: { users: user } });
  },
  [REMOVE_USER_FROM_GROUP](groupId, user) {
    // checkGroupIdAndUser(groupId, user); // TODO: add
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (getGroupOwnerId(groupId) !== this.userId) {
      throw new Meteor.Error("You aren't owner of the group");
    }
    UserGroupCollection.update({ _id: groupId }, { $pull: { users: user } });
  },
});
